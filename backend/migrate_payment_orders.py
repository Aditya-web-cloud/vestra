from sqlalchemy import (
    inspect,
    text,
)

from database import engine


def main():

    inspector = inspect(
        engine
    )


    tables = inspector.get_table_names()


    if "payment_intents" not in tables:

        print(
            "payment_intents table does not exist yet."
        )

        return


    columns = {
        column["name"]
        for column
        in inspector.get_columns(
            "payment_intents"
        )
    }


    with engine.begin() as connection:

        if (
            "vestra_order_id"
            not in columns
        ):

            connection.execute(
                text(
                    """
                    ALTER TABLE payment_intents
                    ADD COLUMN vestra_order_id INTEGER
                    """
                )
            )


            print(
                "Added vestra_order_id."
            )

        else:

            print(
                "vestra_order_id already exists."
            )


        connection.execute(
            text(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS
                ix_payment_intents_vestra_order_id
                ON payment_intents (vestra_order_id)
                """
            )
        )


    print(
        "PaymentIntent migration complete."
    )


if __name__ == "__main__":

    main()