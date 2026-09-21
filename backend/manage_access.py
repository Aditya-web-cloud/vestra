import sys

from database import SessionLocal

from models import User

from access_models import (
    UserAccess,
)

from access_control import (
    ROLE_ADMIN,
    VALID_ROLES,
)


def set_role(
    username: str,
    role: str,
):

    username = (
        username
        .strip()
        .lower()
    )


    role = (
        role
        .strip()
        .lower()
    )


    if role not in VALID_ROLES:

        print(
            "Invalid role."
        )


        print(
            "Valid roles: "
            "customer, shopkeeper, admin"
        )


        return


    db = SessionLocal()


    try:

        user = (
            db.query(User)
            .filter(
                User.username ==
                username
            )
            .first()
        )


        if not user:

            print(
                f"User '{username}' "
                "was not found."
            )


            return


        access = (
            db.query(UserAccess)
            .filter(
                UserAccess.user_id ==
                user.id
            )
            .first()
        )


        if not access:

            access = UserAccess(
                user_id=user.id,
                role=role,
                is_approved=True,
            )


            db.add(
                access
            )


        else:

            access.role = role

            access.is_approved = True


        # Keep old admin functionality compatible.
        user.is_admin = (
            role ==
            ROLE_ADMIN
        )


        db.commit()


        print(
            "--------------------------------"
        )


        print(
            "VESTRA access updated"
        )


        print(
            f"Username : {user.username}"
        )


        print(
            f"Role     : {role}"
        )


        print(
            "--------------------------------"
        )


    finally:

        db.close()


if __name__ == "__main__":

    if len(sys.argv) != 3:

        print(
            "Usage:"
        )


        print(
            "python manage_access.py "
            "<username> "
            "<customer|shopkeeper|admin>"
        )


        raise SystemExit(
            1
        )


    set_role(
        sys.argv[1],
        sys.argv[2],
    )