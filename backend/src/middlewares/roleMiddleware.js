export function requireRole(...allowedRoles) {
  const flatRoles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!flatRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access forbidden: Role '${req.user.role}' is not authorized. Required: [${flatRoles.join(', ')}]`
      });
    }

    next();
  };
}

export default requireRole;
