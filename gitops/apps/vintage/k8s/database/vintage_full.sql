--
-- PostgreSQL database cluster dump
--

\restrict 8DFBk7zz7K84l1inWldUNcZDKHq1t7F63ZVIj1AoS9C9K3iJWDUZqNrnK7VYj7e

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles intentionally omitted. Kubernetes owns the postgres runtime
-- credential through the vintage-secrets ExternalSecret; restoring role
-- passwords from this dump would desynchronise the database from the
-- Secret used by application pods.
--

--
-- User Configurations
--








\unrestrict 8DFBk7zz7K84l1inWldUNcZDKHq1t7F63ZVIj1AoS9C9K3iJWDUZqNrnK7VYj7e

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict y9EZa3Bye6KjzmhWqNv9eiFpqD1QlU6wKgMhFKrBRytYyEBA8a6ZOe7NeN6ydxY

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict y9EZa3Bye6KjzmhWqNv9eiFpqD1QlU6wKgMhFKrBRytYyEBA8a6ZOe7NeN6ydxY

--
-- Database "auth_db" dump
--

--
-- PostgreSQL database dump
--

\restrict p93g7CKAQWVb1e708wOtDKio78lYfkotgMJbdaeeGrAJgSu4jd9FdSxmzP0Fbsr

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE auth_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE auth_db OWNER TO postgres;

\unrestrict p93g7CKAQWVb1e708wOtDKio78lYfkotgMJbdaeeGrAJgSu4jd9FdSxmzP0Fbsr
\connect auth_db
\restrict p93g7CKAQWVb1e708wOtDKio78lYfkotgMJbdaeeGrAJgSu4jd9FdSxmzP0Fbsr

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict p93g7CKAQWVb1e708wOtDKio78lYfkotgMJbdaeeGrAJgSu4jd9FdSxmzP0Fbsr

--
-- Database "vintage_db" dump
--

--
-- PostgreSQL database dump
--

\restrict ngudfYNR3sTyFZmukmjOIzghQB4ahIsKvznaRZCha28ykfB67HutxK8D38j5Tad

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: vintage_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE vintage_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE vintage_db OWNER TO postgres;

\unrestrict ngudfYNR3sTyFZmukmjOIzghQB4ahIsKvznaRZCha28ykfB67HutxK8D38j5Tad
\connect vintage_db
\restrict ngudfYNR3sTyFZmukmjOIzghQB4ahIsKvznaRZCha28ykfB67HutxK8D38j5Tad

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    image_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    product_id uuid,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    total_amount numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    shipping_address text,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid,
    image_url character varying(500) NOT NULL,
    alt_text character varying(255),
    is_primary boolean DEFAULT false,
    sort_order integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    short_description text,
    sku character varying(100),
    brand character varying(100),
    category_id uuid,
    price numeric(10,2) NOT NULL,
    compare_price numeric(10,2),
    materials text,
    care_instructions text,
    inventory_quantity integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    role character varying(50) DEFAULT 'customer'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, image_url, created_at, updated_at) FROM stdin;
274cfdcb-1d8a-4563-93f3-a62e72c9e6f6	Dresses	Vintage dresses	\N	2026-06-23 00:00:00	2026-06-23 00:00:00
0f22f7b3-f87a-4603-9e7f-93dc0b42ec65	Accessories	Scarves, bags, and finishing pieces	\N	2026-06-23 00:00:00	2026-06-23 00:00:00
61e5f91b-4fb0-4116-8c6b-6dd947331daa	Outerwear	Coats and jackets	\N	2026-06-23 00:00:00	2026-06-23 00:00:00
8db2bf2a-cbb6-4db2-9ff0-cb14ce94067b	Denim	Vintage denim	\N	2026-06-23 00:00:00	2026-06-23 00:00:00
d7ab35db-b100-47ec-9316-3a89a1df4ebf	Tops	Shirts and blouses	\N	2026-06-23 00:00:00	2026-06-23 00:00:00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, price, created_at) FROM stdin;
b9460644-95f4-47ac-853d-9579ac793f0b	8d46347c-43db-4f01-b6c7-d5d3288f0ecb	67be2d5e-ecfb-4bf9-b751-8474f9d7bcac	2	128.00	2026-06-23 00:00:00
3fa1ac0a-4d34-4e0c-8a5d-7f83f3633c8d	8d46347c-43db-4f01-b6c7-d5d3288f0ecb	e858df02-4a5b-4f8e-a1f4-2b6c28150d0b	1	154.00	2026-06-23 00:00:00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, first_name, last_name, role, created_at, updated_at) FROM stdin;
f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6	demo@hirayavintage.test	$2a$10$Vtk/SwGgIxJMtCLix.Gm8uKzVdeZIEE/DxWCbXUcJXt.3bYxGHW.y	Demo	User	customer	2026-06-23 00:00:00	2026-06-23 00:00:00
\.


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ngudfYNR3sTyFZmukmjOIzghQB4ahIsKvznaRZCha28ykfB67HutxK8D38j5Tad

--
-- Database "orders_db" dump
--

--
-- PostgreSQL database dump
--

\restrict eTVQIHKYS2Lvu62heWXuS7wI63NUtOMYfQ7ssjjw3vMLqMIgQsmGefHp2t5DigH

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: orders_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE orders_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE orders_db OWNER TO postgres;

\unrestrict eTVQIHKYS2Lvu62heWXuS7wI63NUtOMYfQ7ssjjw3vMLqMIgQsmGefHp2t5DigH
\connect orders_db
\restrict eTVQIHKYS2Lvu62heWXuS7wI63NUtOMYfQ7ssjjw3vMLqMIgQsmGefHp2t5DigH

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: order_service; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA order_service;


ALTER SCHEMA order_service OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: orders; Type: TABLE; Schema: order_service; Owner: postgres
--

CREATE TABLE order_service.orders (
    id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE order_service.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: order_service; Owner: postgres
--

CREATE SEQUENCE order_service.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE order_service.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: order_service; Owner: postgres
--

ALTER SEQUENCE order_service.orders_id_seq OWNED BY order_service.orders.id;


--
-- Name: orders id; Type: DEFAULT; Schema: order_service; Owner: postgres
--

ALTER TABLE ONLY order_service.orders ALTER COLUMN id SET DEFAULT nextval('order_service.orders_id_seq'::regclass);


--
-- Data for Name: orders; Type: TABLE DATA; Schema: order_service; Owner: postgres
--

COPY order_service.orders (id, product_id, created_at) FROM stdin;
\.


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: order_service; Owner: postgres
--

SELECT pg_catalog.setval('order_service.orders_id_seq', 1, false);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: order_service; Owner: postgres
--

ALTER TABLE ONLY order_service.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict eTVQIHKYS2Lvu62heWXuS7wI63NUtOMYfQ7ssjjw3vMLqMIgQsmGefHp2t5DigH

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict FstxkrMDaBlLIMjpqqBdBV4M6zG33ixCRE38xZ9IDh8MBCSPRZLwn274hPqftdc

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict FstxkrMDaBlLIMjpqqBdBV4M6zG33ixCRE38xZ9IDh8MBCSPRZLwn274hPqftdc

--
-- Database "products_db" dump
--

--
-- PostgreSQL database dump
--

\restrict 5aM8ojgDpTHysSdLRAV10eytfJgZxB6WarBqTsG0G07byJ1R1j98w7ycC97TB7v

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: products_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE products_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE products_db OWNER TO postgres;

\unrestrict 5aM8ojgDpTHysSdLRAV10eytfJgZxB6WarBqTsG0G07byJ1R1j98w7ycC97TB7v
\connect products_db
\restrict 5aM8ojgDpTHysSdLRAV10eytfJgZxB6WarBqTsG0G07byJ1R1j98w7ycC97TB7v

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    image_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_id uuid,
    product_id uuid,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    total_amount numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    shipping_address text,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    product_id uuid,
    image_url character varying(500) NOT NULL,
    alt_text character varying(255),
    is_primary boolean DEFAULT false,
    sort_order integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255),
    description text,
    short_description text,
    sku character varying(100),
    brand character varying(100),
    category_id uuid,
    price numeric(10,2) NOT NULL,
    compare_price numeric(10,2),
    materials text,
    care_instructions text,
    inventory_quantity integer DEFAULT 0,
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    role character varying(50) DEFAULT 'customer'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, image_url, created_at, updated_at) FROM stdin;
274cfdcb-1d8a-4563-93f3-a62e72c9e6f6	Dresses	Vintage dresses	\N	2026-06-23 00:00:00	2026-06-23 00:00:00
0f22f7b3-f87a-4603-9e7f-93dc0b42ec65	Accessories	Scarves, bags, and finishing pieces	\N	2026-06-23 00:00:00	2026-06-23 00:00:00
61e5f91b-4fb0-4116-8c6b-6dd947331daa	Outerwear	Coats and jackets	\N	2026-06-23 00:00:00	2026-06-23 00:00:00
8db2bf2a-cbb6-4db2-9ff0-cb14ce94067b	Denim	Vintage denim	\N	2026-06-23 00:00:00	2026-06-23 00:00:00
d7ab35db-b100-47ec-9316-3a89a1df4ebf	Tops	Shirts and blouses	\N	2026-06-23 00:00:00	2026-06-23 00:00:00
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, price, created_at) FROM stdin;
b9460644-95f4-47ac-853d-9579ac793f0b	8d46347c-43db-4f01-b6c7-d5d3288f0ecb	67be2d5e-ecfb-4bf9-b751-8474f9d7bcac	2	128.00	2026-06-23 00:00:00
3fa1ac0a-4d34-4e0c-8a5d-7f83f3633c8d	8d46347c-43db-4f01-b6c7-d5d3288f0ecb	e858df02-4a5b-4f8e-a1f4-2b6c28150d0b	1	154.00	2026-06-23 00:00:00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, first_name, last_name, role, created_at, updated_at) FROM stdin;
f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6	demo@hirayavintage.test	$2a$10$Vtk/SwGgIxJMtCLix.Gm8uKzVdeZIEE/DxWCbXUcJXt.3bYxGHW.y	Demo	User	customer	2026-06-23 00:00:00	2026-06-23 00:00:00
\.


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 5aM8ojgDpTHysSdLRAV10eytfJgZxB6WarBqTsG0G07byJ1R1j98w7ycC97TB7v

--
-- Database "users_db" dump
--

--
-- PostgreSQL database dump
--

\restrict wrVTBlt75aHhrvfa8IvUG9zxjcEN5GktpRGTiUa3t2cCePtgyUK7M3fL6R52oON

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: users_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE users_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE users_db OWNER TO postgres;

\unrestrict wrVTBlt75aHhrvfa8IvUG9zxjcEN5GktpRGTiUa3t2cCePtgyUK7M3fL6R52oON
\connect users_db
\restrict wrVTBlt75aHhrvfa8IvUG9zxjcEN5GktpRGTiUa3t2cCePtgyUK7M3fL6R52oON

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict wrVTBlt75aHhrvfa8IvUG9zxjcEN5GktpRGTiUa3t2cCePtgyUK7M3fL6R52oON

--
-- PostgreSQL database cluster dump complete
--

