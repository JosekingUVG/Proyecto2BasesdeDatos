import { DataTypes } from "sequelize";
import { initProcedimientos } from "./procedimientos.js";

export function initModels(sequelize) {
	const Proveedor = sequelize.define(
		"proveedor",
		{
			id_proveedor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			nombre_proveedor: { type: DataTypes.STRING(100), allowNull: false },
		},
		{ tableName: "proveedor", timestamps: false },
	);

	const Empleado = sequelize.define(
		"empleado",
		{
			id_empleado: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			nombre: { type: DataTypes.STRING(100), allowNull: false },
			usuario: { type: DataTypes.STRING(50), allowNull: false, unique: true },
			contrasena: { type: DataTypes.TEXT, allowNull: false },
		},
		{ tableName: "empleado", timestamps: false },
	);

	const Producto = sequelize.define(
		"producto",
		{
			id_producto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			categoria: { type: DataTypes.STRING(50), allowNull: false },
			precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
			marca: { type: DataTypes.STRING(50) },
			id_proveedor: { type: DataTypes.INTEGER, allowNull: false },
			status_producto: { type: DataTypes.STRING(20), defaultValue: "activo" },
			cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
			costo: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
		},
		{ tableName: "producto", timestamps: false },
	);

	const Venta = sequelize.define(
		"venta",
		{
			id_venta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			id_empleado: { type: DataTypes.INTEGER, allowNull: false },
			total_vendido: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
			fecha_venta: { type: DataTypes.DATE, allowNull: false },
		},
		{ tableName: "venta", timestamps: false },
	);

	const DetalleVenta = sequelize.define(
		"detalle_venta",
		{
			id_detalle: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
			id_venta: { type: DataTypes.INTEGER, allowNull: false },
			id_producto: { type: DataTypes.INTEGER, allowNull: false },
			cantidad_producto: { type: DataTypes.INTEGER, allowNull: false },
			precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
		},
		{ tableName: "detalle_venta", timestamps: false },
	);

	Producto.belongsTo(Proveedor, { foreignKey: "id_proveedor", as: "proveedor" });
	Proveedor.hasMany(Producto, { foreignKey: "id_proveedor" });
	Venta.belongsTo(Empleado, { foreignKey: "id_empleado", as: "empleado" });
	Empleado.hasMany(Venta, { foreignKey: "id_empleado" });
	Venta.hasMany(DetalleVenta, { foreignKey: "id_venta", as: "detalles" });
	DetalleVenta.belongsTo(Venta, { foreignKey: "id_venta" });
	DetalleVenta.belongsTo(Producto, { foreignKey: "id_producto", as: "producto" });

	const procedimientos = initProcedimientos(sequelize);

	return {
		Proveedor,
		Empleado,
		Producto,
		Venta,
		DetalleVenta,
		procedimientos,
	};
}
