export function requireRoles(...rolesPermitidos) {
	return (req, res, next) => {
		if (!req.user?.rol) {
			return res.status(401).json({ message: "No autenticado" });
		}

		if (!rolesPermitidos.includes(req.user.rol)) {
			return res.status(403).json({
				message: "No tiene permisos para realizar esta operacion",
			});
		}

		next();
	};
}
