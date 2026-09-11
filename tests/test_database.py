from backend.user_repository import (
    create_user,
    delete_user,
    get_user_by_id,
    update_user,
)


def test_create_and_retrieve_user():
    created_user = create_user(
        name="Database Test User",
        email="database@test.com",
    )

    assert created_user["id"] == 1
    assert created_user["name"] == "Database Test User"
    assert created_user["email"] == "database@test.com"

    retrieved_user = get_user_by_id(
        created_user["id"]
    )

    assert retrieved_user is not None

    assert (
        retrieved_user["name"]
        == "Database Test User"
    )

    assert (
        retrieved_user["email"]
        == "database@test.com"
    )


def test_update_user():
    user = create_user(
        name="Original Name",
        email="original@test.com",
    )

    updated_user = update_user(
        user_id=user["id"],
        name="Updated Name",
        email="updated@test.com",
    )

    assert updated_user["name"] == "Updated Name"
    assert updated_user["email"] == "updated@test.com"


def test_delete_user():
    user = create_user(
        name="Delete Me",
        email="delete@test.com",
    )

    deleted = delete_user(
        user["id"]
    )

    assert deleted is True

    retrieved_user = get_user_by_id(
        user["id"]
    )

    assert retrieved_user is None