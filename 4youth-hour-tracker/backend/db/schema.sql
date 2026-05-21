CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('employee', 'admin'))
);

CREATE TABLE pay_rates (
    id SERIAL PRIMARY KEY,
    institution_id INTEGER NOT NULL REFERENCES institutions(id),
    season TEXT NOT NULL CHECK (season IN ('summer', 'school_year')),
    instructional_hours NUMERIC(4, 1) NOT NULL,
    paid_hours NUMERIC(4, 1) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL
);

CREATE TABLE pay_periods (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    institution_id INTEGER NOT NULL REFERENCES institutions(id),
    pay_rate_id INTEGER NOT NULL REFERENCES pay_rates(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    season TEXT NOT NULL CHECK (season IN ('summer', 'school_year')),
    attendance TEXT NOT NULL CHECK (attendance IN ('active', 'absent', 'modified'))
);

CREATE TABLE worklogs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    schedule_id INTEGER NOT NULL REFERENCES schedules(id),
    pay_period_id INTEGER NOT NULL REFERENCES pay_periods(id),
    institution_id INTEGER NOT NULL REFERENCES institutions(id),
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied')),
    extra_hours NUMERIC(4, 1),
    reasoning: TEXT -- Optional field for employees to provide reasoning for extra hours or absences
);
