-- H2 OTHER stores a java object, can swap EVENT_TAG to a VARCHAR if doing plain string
-- Need to double check that currency tags are only 3

CREATE TABLE IF NOT EXISTS EVENT (
    EVENT_ID    INT PRIMARY KEY AUTO_INCREMENT,
    EVENT_NAME  VARCHAR(255)     NOT NULL,
    START_TIME  TIME             NOT NULL,
    START_DATE  DATE             NOT NULL,
    END_TIME    TIME             NOT NULL,
    END_DATE    DATE             NOT NULL,
    LOCATION    OTHER,
    CURRENCY    CHAR(3),
    AMOUNT      NUMERIC(20,2),
    EVENT_TAG   OTHER
);