import { db, isPostgresActive } from '../config/db.js';

export async function getComplaints(req, res) {
  try {
    const { status, type, zone } = req.query;

    if (isPostgresActive()) {
      let query = 'SELECT * FROM complaints WHERE 1=1';
      const params = [];
      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }
      if (type) {
        params.push(type);
        query += ` AND complaint_type = $${params.length}`;
      }
      if (zone) {
        params.push(zone);
        query += ` AND related_zone = $${params.length}`;
      }
      query += ' ORDER BY created_at DESC';
      const result = await db.query(query, params);
      return res.json({ total: result.rows.length, complaints: result.rows });
    }

    const store = db.getFallbackStore();
    let list = [...store.complaints];
    if (status) list = list.filter(c => c.status === status);
    if (type) list = list.filter(c => c.complaint_type === type);
    if (zone) list = list.filter(c => c.related_zone === zone);

    return res.json({ total: list.length, complaints: list });
  } catch (err) {
    console.error('[Complaints List Error]:', err);
    return res.status(500).json({ error: 'Failed to retrieve complaints' });
  }
}

export async function submitComplaint(req, res) {
  try {
    const { citizen_name, citizen_phone, complaint_type, description, location_desc, latitude, longitude, related_zone, related_pipeline_id, image_url } = req.body;

    if (!citizen_name || !complaint_type || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Name, complaint type, description, and map coordinates are required' });
    }

    const citizenId = req.user?.id || 4;

    const newComplaint = {
      citizen_id: citizenId,
      citizen_name,
      citizen_phone: citizen_phone || '+91 9876543210',
      complaint_type,
      description,
      location_desc: location_desc || 'Geotagged Pin on Water Network Map',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      related_zone: related_zone || 'ZONE_A',
      related_pipeline_id: related_pipeline_id || null,
      image_url: image_url || null,
      status: 'SUBMITTED',
      created_at: new Date().toISOString()
    };

    if (isPostgresActive()) {
      const result = await db.query(
        `INSERT INTO complaints (citizen_id, citizen_name, citizen_phone, complaint_type, description, location_desc, latitude, longitude, related_zone, related_pipeline_id, image_url, status, geom)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, ST_SetSRID(ST_MakePoint($8, $7), 4326))
         RETURNING *`,
        [newComplaint.citizen_id, newComplaint.citizen_name, newComplaint.citizen_phone, newComplaint.complaint_type,
         newComplaint.description, newComplaint.location_desc, newComplaint.latitude, newComplaint.longitude,
         newComplaint.related_zone, newComplaint.related_pipeline_id, newComplaint.image_url, newComplaint.status]
      );
      return res.status(201).json({ message: 'Complaint registered successfully', complaint: result.rows[0] });
    }

    const store = db.getFallbackStore();
    newComplaint.id = store.complaints.length + 1;
    store.complaints.unshift(newComplaint);
    return res.status(201).json({ message: 'Complaint registered successfully', complaint: newComplaint });
  } catch (err) {
    console.error('[Submit Complaint Error]:', err);
    return res.status(500).json({ error: 'Failed to register complaint' });
  }
}

export async function updateComplaintStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    if (!['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid complaint status' });
    }

    if (isPostgresActive()) {
      const result = await db.query(
        `UPDATE complaints
         SET status = $1, resolution_notes = COALESCE($2, resolution_notes), updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 RETURNING *`,
        [status, resolution_notes, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Complaint not found' });
      return res.json({ message: 'Complaint status updated', complaint: result.rows[0] });
    }

    const store = db.getFallbackStore();
    const complaint = store.complaints.find(c => c.id === parseInt(id, 10));
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    complaint.status = status;
    if (resolution_notes) complaint.resolution_notes = resolution_notes;
    complaint.updated_at = new Date().toISOString();

    return res.json({ message: 'Complaint status updated', complaint });
  } catch (err) {
    console.error('[Update Complaint Error]:', err);
    return res.status(500).json({ error: 'Failed to update complaint' });
  }
}

export default {
  getComplaints,
  submitComplaint,
  updateComplaintStatus
};
