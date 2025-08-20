-- TABLA CATEGORIAS

CREATE TABLE IF NOT EXISTS public.categorias
(
    id_categoria bigint NOT NULL,
    nombre_cat character varying(15) COLLATE pg_catalog."default" NOT NULL,
    descripcion character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT categorias_pkey PRIMARY KEY (id_categoria)
)

-- Tabla: sub_categorias
CREATE TABLE IF NOT EXISTS public.sub_categorias
(
    id_subcat bigint NOT NULL,
    nombre_subcat character varying(30) COLLATE pg_catalog."default" NOT NULL,
    descripcion character varying(50) COLLATE pg_catalog."default",
    categoria bigint,
    CONSTRAINT sub_categorias_pkey PRIMARY KEY (id_subcat),
    CONSTRAINT fk_categoria FOREIGN KEY (categoria)
        REFERENCES public.categorias (id_categoria) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

-- Tabla: carta (menú)
CREATE TABLE IF NOT EXISTS public.carta
(
    id_carta bigint NOT NULL,
    categoria bigint NOT NULL,
    sub_categoria bigint NOT NULL,
    nombre character varying(50) COLLATE pg_catalog."default" NOT NULL,
    grupo character varying(50) COLLATE pg_catalog."default" NOT NULL,
    abreviado character varying(30) COLLATE pg_catalog."default" NOT NULL,
    precio money NOT NULL,
    puntos_canje bigint, -- puntos requeridos para canjear
    estado boolean NOT NULL DEFAULT true,
    disponible boolean NOT NULL,
    porcion character varying(15) COLLATE pg_catalog."default" NOT NULL,
    unidad_medida character varying(20) COLLATE pg_catalog."default" NOT NULL,
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

-- Tabla: mesas
CREATE TABLE IF NOT EXISTS public.mesas
(
    id_mesas bigint NOT NULL,
    nombre character varying(15) COLLATE pg_catalog."default" NOT NULL,
    capacidad bigint NOT NULL,
    disponibilidad boolean NOT NULL,
    CONSTRAINT mesas_pkey PRIMARY KEY (id_mesas)
)

-- Tabla: usuarios (empleados: meseros, cajeros, etc.)
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
    CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario),
    CONSTRAINT foreignkey_tipo_usuario FOREIGN KEY (tipo_usuario)
        REFERENCES public.niveles_usuarios (id_tipo_usuario) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

-- Tabla: clientes (con sistema de puntos)
CREATE TABLE IF NOT EXISTS public.clientes
(
    id_cliente bigint NOT NULL,
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

-- Tabla: inventario
CREATE TABLE IF NOT EXISTS public.inventario
(
    id_inventario bigint NOT NULL,
    nombre_producto character varying(50) COLLATE pg_catalog."default" NOT NULL,
    stock_actual bigint NOT NULL,
    unidad_stock character varying(20) COLLATE pg_catalog."default" NOT NULL,
    contenido_por_unidad bigint NOT NULL,
    unidad_contenido character varying(20) COLLATE pg_catalog."default" NOT NULL,
    estado boolean DEFAULT true,
    precio_por_unidad bigint,
    id_proveedor bigint,
    CONSTRAINT inventario_pkey PRIMARY KEY (id_inventario)
)

-- Tabla: receta (ingredientes por producto)
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

-- Tabla: pedidos (cabecera)
CREATE TABLE IF NOT EXISTS public.pedidos
(
    id_pedido serial NOT NULL,
    numero_orden serial NOT NULL,
    id_mesa bigint,
    id_cliente bigint, --puede ser NULL si es anónimo, pero mejor no
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
    monto_pagado money,
    monto_vuelto money,
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

-- Tabla: detalle_pedido (líneas del pedido)
CREATE TABLE IF NOT EXISTS public.detalle_pedido
(
    id_detalle serial NOT NULL,
    id_pedido bigint,
    id_carta bigint,
    cantidad bigint NOT NULL,
    precio_unitario money,
    observacion character(100) COLLATE pg_catalog."default",
    es_canjeable boolean DEFAULT false,
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

-- Tabla: historial_puntos (auditoría de puntos)
CREATE TABLE IF NOT EXISTS public.historial_puntos
(
    id_historial bigint NOT NULL,
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

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(id_cliente);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido ON detalle_pedido(id_pedido);
CREATE INDEX IF NOT EXISTS idx_historial_puntos ON historial_puntos(id_cliente, fecha);