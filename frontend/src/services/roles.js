const NAV_BY_KEY = {
	pedido: { label: "Nuevo Pedido", href: "/nuevo-pedido", key: "pedido" },
	producto: { label: "Producto", href: "/producto", key: "producto" },
	reportes: { label: "Reportes", href: "/reportes", key: "reportes" },
	inventario: { label: "Inventario", href: "/inventario", key: "inventario" },
};

const ROLE_CONFIG = {
	admin: {
		nav: ["pedido", "producto", "reportes", "inventario"],
		defaultRoute: "/inventario",
		showCosto: true,
		canEditCatalog: true,
		canEditInventario: true,
	},
	subadmin: {
		nav: ["producto", "reportes", "inventario"],
		defaultRoute: "/inventario",
		showCosto: true,
		canEditCatalog: true,
		canEditInventario: false,
	},
	vendedor: {
		nav: ["pedido", "inventario"],
		defaultRoute: "/nuevo-pedido",
		showCosto: false,
		canEditCatalog: false,
		canEditInventario: false,
	},
	digitador: {
		nav: ["producto", "inventario"],
		defaultRoute: "/inventario",
		showCosto: true,
		canEditCatalog: true,
		canEditInventario: true,
	},
	auditor: {
		nav: ["reportes", "inventario"],
		defaultRoute: "/reportes",
		showCosto: true,
		canEditCatalog: false,
		canEditInventario: false,
	},
};

const PAGE_KEY_BY_PATH = {
	"/inventario": "inventario",
	"/nuevo-pedido": "pedido",
	"/producto": "producto",
	"/reportes": "reportes",
};

export function getRoleConfig(rol) {
	return ROLE_CONFIG[rol] || null;
}

export function getDefaultRoute(rol) {
	return getRoleConfig(rol)?.defaultRoute || "/inventario";
}

export function getNavItemsForRole(rol) {
	const config = getRoleConfig(rol);
	if (!config) return [];
	return config.nav.map((key) => NAV_BY_KEY[key]);
}

export function canAccessPage(rol, pageKey) {
	const config = getRoleConfig(rol);
	if (!config) return false;
	return config.nav.includes(pageKey);
}

export function getPageKeyFromPath(pathname) {
	return PAGE_KEY_BY_PATH[pathname] || null;
}

export function assertPageAccess(rol, pathname) {
	const pageKey = getPageKeyFromPath(pathname);
	if (!pageKey) return true;
	return canAccessPage(rol, pageKey);
}

export function getInventoryPermissions(rol) {
	const config = getRoleConfig(rol) || {};
	return {
		readonly: !config.canEditCatalog && !config.canEditInventario,
		canEditCatalog: Boolean(config.canEditCatalog),
		canEditInventario: Boolean(config.canEditInventario),
		showCosto: Boolean(config.showCosto),
	};
}

export function formatRolLabel(rol) {
	const labels = {
		admin: "Administrador",
		subadmin: "Sub-Administrador",
		vendedor: "Vendedor",
		digitador: "Digitador",
		auditor: "Auditor",
	};
	return labels[rol] || rol || "Sin rol";
}
