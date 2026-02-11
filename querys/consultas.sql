estas son mis tablas

CREATE TABLE IF NOT EXISTS public.asistencias
(
    id_asistencia bigint NOT NULL DEFAULT nextval('asistencia_id_asistencia_seq'::regclass),
    id_usuario bigint NOT NULL,
    id_sede bigint NOT NULL,
    id_turno bigint NOT NULL,
    fecha date NOT NULL,
    hora_entrada_real time without time zone,
    hora_salida_real time without time zone,
    estado_asistencia character varying(15) COLLATE pg_catalog."default" NOT NULL,
    observacion character varying(255) COLLATE pg_catalog."default",
    hora_entrada_horario time without time zone NOT NULL,
    hora_salida_horario time without time zone NOT NULL,
    CONSTRAINT asistencias_pkey PRIMARY KEY (id_asistencia),
    CONSTRAINT uq_asistencia_dia_turno_usuario UNIQUE (id_usuario, id_turno, fecha),
    CONSTRAINT fk_asistencia_sede FOREIGN KEY (id_sede)
        REFERENCES public.sedes (id_sede) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_asistencia_turno FOREIGN KEY (id_turno)
        REFERENCES public.turnos (id_turno) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE RESTRICT,
    CONSTRAINT fk_asistencia_usuario FOREIGN KEY (id_usuario)
        REFERENCES public.usuarios (id_usuario) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE RESTRICT,
    CONSTRAINT chk_estado_asistencia CHECK (estado_asistencia::text = ANY (ARRAY['puntual'::character varying, 'tarde'::character varying, 'falta'::character varying, 'justificado'::character varying, 'vacaciones'::character varying, 'licencia con goce'::character varying, 'licencia sin goce'::character varying]::text[]))
)

CREATE TABLE IF NOT EXISTS public.carta
(
    id_carta bigint NOT NULL DEFAULT nextval('carta_id_carta_seq'::regclass),
    categoria bigint NOT NULL,
    sub_categoria bigint NOT NULL,
    nombre character varying(50) COLLATE pg_catalog."default" NOT NULL,
    grupo character varying(50) COLLATE pg_catalog."default" NOT NULL,
    abreviado character varying(30) COLLATE pg_catalog."default" NOT NULL,
    precio numeric(10,2) NOT NULL,
    puntos_canje bigint,
    estado boolean NOT NULL DEFAULT true,
    disponible boolean NOT NULL,
    porcion character varying(15) COLLATE pg_catalog."default",
    unidad_medida character varying(20) COLLATE pg_catalog."default",
    observacion character varying(100) COLLATE pg_catalog."default",
    url_imagen character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT carta_pkey PRIMARY KEY (id_carta),
    CONSTRAINT fk_carta_categoria FOREIGN KEY (categoria)
        REFERENCES public.categorias (id_categoria) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT fk_carta_sub_categoria FOREIGN KEY (sub_categoria)
        REFERENCES public.sub_categorias (id_subcat) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
)

CREATE TABLE IF NOT EXISTS public.categorias
(
    id_categoria bigint NOT NULL DEFAULT nextval('categorias_id_categoria_seq'::regclass),
    nombre_cat character varying(15) COLLATE pg_catalog."default" NOT NULL,
    descripcion character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria)
)

CREATE TABLE IF NOT EXISTS public.clientes
(
    id_cliente bigint NOT NULL DEFAULT nextval('clientes_id_cliente_seq'::regclass),
    nombres character varying(50) COLLATE pg_catalog."default" NOT NULL,
    ape_paterno character varying(30) COLLATE pg_catalog."default",
    ape_materno character varying(30) COLLATE pg_catalog."default",
    celular character varying(15) COLLATE pg_catalog."default",
    dni character varying(12) COLLATE pg_catalog."default" NOT NULL,
    puntos_acumulados bigint,
    fecha_registro date NOT NULL,
    estado boolean DEFAULT true,
    CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente)
)

CREATE TABLE IF NOT EXISTS public.detalle_pedido
(
    id_detalle integer NOT NULL DEFAULT nextval('detalle_pedido_id_detalle_seq'::regclass),
    id_pedido bigint,
    id_carta bigint,
    cantidad bigint NOT NULL,
    precio_unitario numeric(10,2),
    observacion text COLLATE pg_catalog."default",
    es_canjeable boolean DEFAULT false,
    estado character varying(20) COLLATE pg_catalog."default",
    canjeado_por integer,
    cuenta bigint,
    CONSTRAINT detalle_pedido_pkey PRIMARY KEY (id_detalle),
    CONSTRAINT fk_detalle_carta FOREIGN KEY (id_carta)
        REFERENCES public.carta (id_carta) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido)
        REFERENCES public.pedidos (id_pedido) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
)

CREATE TABLE IF NOT EXISTS public.pedidos
(
    id_pedido integer NOT NULL DEFAULT nextval('pedidos_id_pedido_seq'::regclass),
    numero_orden integer NOT NULL DEFAULT nextval('pedidos_numero_orden_seq'::regclass),
    id_mesa bigint,
    id_cliente bigint,
    id_usuario bigint,
    fecha date,
    hora_pedido time(0) with time zone NOT NULL,
    hora_entrega time(0) with time zone,
    hora_pago time(0) with time zone,
    estado character varying(20) COLLATE pg_catalog."default",
    cantidad_clientes bigint,
    observacion character varying(100) COLLATE pg_catalog."default",
    forma_pago character varying(20) COLLATE pg_catalog."default",
    puntos_canjeados_total bigint,
    monto_pagado numeric(10,2),
    monto_vuelto numeric(10,2),
    CONSTRAINT pedidos_pkey PRIMARY KEY (id_pedido),
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (id_cliente)
        REFERENCES public.clientes (id_cliente) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT fk_pedido_mesa FOREIGN KEY (id_mesa)
        REFERENCES public.mesas (id_mesas) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario)
        REFERENCES public.usuarios (id_usuario) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
)

CREATE TABLE IF NOT EXISTS public.historial_puntos
(
    id_historial bigint NOT NULL DEFAULT nextval('historial_puntos_id_historial_seq'::regclass),
    id_cliente bigint NOT NULL,
    id_pedido bigint,
    tipo character varying(15) COLLATE pg_catalog."default" NOT NULL,
    puntos bigint,
    fecha date,
    descripcion character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT historial_puntos_pkey PRIMARY KEY (id_historial),
    CONSTRAINT fk_historial_cliente FOREIGN KEY (id_cliente)
        REFERENCES public.clientes (id_cliente) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT fk_historial_pedido FOREIGN KEY (id_pedido)
        REFERENCES public.pedidos (id_pedido) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
)

CREATE TABLE IF NOT EXISTS public.inventario
(
    id_inventario bigint NOT NULL,
    nombre_producto character varying(50) COLLATE pg_catalog."default" NOT NULL,
    stock_actual bigint NOT NULL,
    unidad_stock character varying(20) COLLATE pg_catalog."default" NOT NULL,
    contenido_por_unidad bigint NOT NULL,
    unidad_contenido character varying(20) COLLATE pg_catalog."default" NOT NULL,
    estado boolean DEFAULT true,
    precio_por_unidad numeric(10,2),
    id_proveedor bigint,
    CONSTRAINT inventario_pkey PRIMARY KEY (id_inventario)
)

CREATE TABLE IF NOT EXISTS public.mesas
(
    id_mesas bigint NOT NULL DEFAULT nextval('mesas_id_mesas_seq'::regclass),
    nombre character varying(15) COLLATE pg_catalog."default" NOT NULL,
    capacidad bigint NOT NULL,
    disponibilidad boolean NOT NULL,
    tipo_mesa character varying(15) COLLATE pg_catalog."default",
    CONSTRAINT mesas_pkey PRIMARY KEY (id_mesas)
)

CREATE TABLE IF NOT EXISTS public.niveles_usuarios
(
    id_tipo_usuario bigint NOT NULL,
    nombre character varying(30) COLLATE pg_catalog."default" NOT NULL,
    descripcion character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT niveles_usuarios_pkey PRIMARY KEY (id_tipo_usuario)
)

CREATE TABLE IF NOT EXISTS public.pagos
(
    id_pago integer NOT NULL DEFAULT nextval('pagos_id_pago_seq'::regclass),
    id_pedido bigint NOT NULL,
    cuenta integer NOT NULL,
    monto_total numeric(10,2) NOT NULL,
    metodo_pago character varying(50) COLLATE pg_catalog."default" NOT NULL,
    fecha_pago timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    observacion text COLLATE pg_catalog."default",
    CONSTRAINT pagos_pkey PRIMARY KEY (id_pago),
    CONSTRAINT fk_pago_pedido FOREIGN KEY (id_pedido)
        REFERENCES public.pedidos (id_pedido) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS public.receta
(
    id_receta bigint NOT NULL,
    id_carta bigint,
    id_inventario bigint,
    cantidad_necesaria bigint,
    CONSTRAINT fk_receta_carta FOREIGN KEY (id_carta)
        REFERENCES public.carta (id_carta) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT fk_receta_inventario FOREIGN KEY (id_inventario)
        REFERENCES public.inventario (id_inventario) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
)

CREATE TABLE IF NOT EXISTS public.sedes
(
    id_sede bigint NOT NULL DEFAULT nextval('sede_id_sede_seq'::regclass),
    nombre_sede character varying(50) COLLATE pg_catalog."default" NOT NULL,
    direccion character varying(50) COLLATE pg_catalog."default",
    latitud double precision,
    longitud double precision,
    capacidad bigint,
    estado boolean,
    fecha_creacion date,
    tipo_sede character varying(15) COLLATE pg_catalog."default",
    CONSTRAINT sedes_pkey PRIMARY KEY (id_sede)
)

CREATE TABLE IF NOT EXISTS public.sub_categorias
(
    id_subcat bigint NOT NULL DEFAULT nextval('sub_categorias_id_subcat_seq'::regclass),
    nombre_subcat character varying(30) COLLATE pg_catalog."default" NOT NULL,
    descripcion character varying(50) COLLATE pg_catalog."default",
    categoria bigint,
    CONSTRAINT sub_categorias_pkey PRIMARY KEY (id_subcat),
    CONSTRAINT fk_categoria FOREIGN KEY (categoria)
        REFERENCES public.categorias (id_categoria) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS public.turnos
(
    id_turno bigint NOT NULL DEFAULT nextval('turno_id_turno_seq'::regclass),
    id_sede bigint NOT NULL,
    nombre_turno character varying(20) COLLATE pg_catalog."default" NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    tolerancia_minutos integer,
    estado boolean,
    CONSTRAINT turnos_pkey PRIMARY KEY (id_turno),
    CONSTRAINT fk_turnos_sede FOREIGN KEY (id_sede)
        REFERENCES public.sedes (id_sede) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

CREATE TABLE IF NOT EXISTS public.usuarios
(
    id_usuario bigint NOT NULL,
    nombres character varying(50) COLLATE pg_catalog."default" NOT NULL,
    ape_paterno character varying(30) COLLATE pg_catalog."default" NOT NULL,
    ape_materno character varying(30) COLLATE pg_catalog."default" NOT NULL,
    apodo character varying(30) COLLATE pg_catalog."default" NOT NULL,
    correo character varying(100) COLLATE pg_catalog."default" NOT NULL,
    pass_encrip character varying(255) COLLATE pg_catalog."default" NOT NULL,
    tipo_usuario bigint NOT NULL,
    estado boolean NOT NULL,
    fecha_creacion date NOT NULL,
    celular character varying(20) COLLATE pg_catalog."default",
    fecha_nacimiento date,
    fecha_contratacion date,
    CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario),
    CONSTRAINT foreignkey_tipo_usuario FOREIGN KEY (tipo_usuario)
        REFERENCES public.niveles_usuarios (id_tipo_usuario) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

CREATE TABLE IF NOT EXISTS public.notificaciones
(
    id_notificacion bigint NOT NULL DEFAULT nextval('notificaciones_id_notificacion_seq'::regclass),
    tipo character varying(20) COLLATE pg_catalog."default" NOT NULL,
    alcance character varying(15) COLLATE pg_catalog."default",
    id_usuario bigint,
    titulo character varying(50) COLLATE pg_catalog."default",
    descripcion text COLLATE pg_catalog."default",
    estado character varying(20) COLLATE pg_catalog."default",
    fecha date,
    hora time with time zone,
    recomendacion character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT notificaciones_pkey PRIMARY KEY (id_notificacion)
)

CREATE TABLE IF NOT EXISTS public.insumos
(
    id_insumo bigint NOT NULL DEFAULT nextval('insumos_id_insumo_seq'::regclass),
    nombre character varying(100) COLLATE pg_catalog."default" NOT NULL,
    categoria character varying(20) COLLATE pg_catalog."default" NOT NULL, -- Ingrediente / Envase / Apoyo
    unidad_medida_base character varying(20) COLLATE pg_catalog."default" NOT NULL,
    estado boolean DEFAULT true,
    fecha_registro date,
    clase character varying(30) COLLATE pg_catalog."default", --leche / azucar / etc etc
    CONSTRAINT insumos_pkey PRIMARY KEY (id_insumo)
)

CREATE TABLE IF NOT EXISTS public.proveedor
(
    id_proveedor bigint NOT NULL DEFAULT nextval('proveedor_id_proveedor_seq'::regclass),
    nombre_proveedor character varying(150) COLLATE pg_catalog."default" NOT NULL,
    ruc_dni character varying(20) COLLATE pg_catalog."default",
    celular character varying(20) COLLATE pg_catalog."default",
    correo character varying(100) COLLATE pg_catalog."default",
    direccion character varying(200) COLLATE pg_catalog."default",
    estado boolean DEFAULT true,
    fecha_registro date,
    observaciones text COLLATE pg_catalog."default",
    CONSTRAINT proveedor_pkey PRIMARY KEY (id_proveedor)
)

CREATE TABLE IF NOT EXISTS public.registro_costos_variables
(
    id_registro bigint NOT NULL DEFAULT nextval('registro_costos_variables_id_registro_seq'::regclass),
    id_insumo bigint NOT NULL,
    id_proveedor bigint,
    precio_unitario numeric(10,2),
    cantidad bigint,
    unidad_medida character varying(20) COLLATE pg_catalog."default",
    total_compra numeric(12,2),
    forma_pago character varying(30) COLLATE pg_catalog."default",
    fecha_registro date,
    hora_registro time without time zone,
    observacion text COLLATE pg_catalog."default",
    CONSTRAINT registro_costos_variables_pkey PRIMARY KEY (id_registro),
    CONSTRAINT fk_registro_insumo FOREIGN KEY (id_insumo)
        REFERENCES public.insumos (id_insumo) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_registro_proveedor FOREIGN KEY (id_proveedor)
        REFERENCES public.proveedor (id_proveedor) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
)

CREATE TABLE IF NOT EXISTS public.registro_costos_variables
(
    id_registro bigint NOT NULL DEFAULT nextval('registro_costos_variables_id_registro_seq'::regclass),
    id_insumo bigint NOT NULL,
    id_proveedor bigint,
    precio_unitario numeric(10,2),
    cantidad bigint,
    unidad_medida character varying(20) COLLATE pg_catalog."default",
    total_compra numeric(12,2),
    forma_pago character varying(30) COLLATE pg_catalog."default",
    fecha_registro date,
    hora_registro time without time zone,
    observacion text COLLATE pg_catalog."default",
    id_usuario bigint,
    CONSTRAINT registro_costos_variables_pkey PRIMARY KEY (id_registro),
    CONSTRAINT fk_registro_insumo FOREIGN KEY (id_insumo)
        REFERENCES public.insumos (id_insumo) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_registro_proveedor FOREIGN KEY (id_proveedor)
        REFERENCES public.proveedor (id_proveedor) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_registro_usuario FOREIGN KEY (id_usuario)
        REFERENCES public.usuarios (id_usuario) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
)

CREATE TABLE IF NOT EXISTS public.empleados
(
    id_empleado bigint NOT NULL DEFAULT nextval('empleado_id_empleado_seq'::regclass),
    id_usuario bigint NOT NULL,
    id_sede bigint,
    sueldo numeric(10,2),
    tipo_contrato character varying(30) COLLATE pg_catalog."default", -- FULL-TIME - PART-TIME - HORAS - INDEPENDIENTE
    fecha_inicio date NOT NULL,
    fecha_fin date,
    estado boolean NOT NULL DEFAULT true,
    tipo_usuario bigint,
    observacion text COLLATE pg_catalog."default",
    CONSTRAINT empleados_pkey PRIMARY KEY (id_empleado),
    CONSTRAINT fk_empleado_sede FOREIGN KEY (id_sede)
        REFERENCES public.sedes (id_sede) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_empleado_tipo_usuario FOREIGN KEY (tipo_usuario)
        REFERENCES public.niveles_usuarios (id_tipo_usuario) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_empleado_usuario FOREIGN KEY (id_usuario)
        REFERENCES public.usuarios (id_usuario) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)