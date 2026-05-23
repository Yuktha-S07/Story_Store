def test_register_login_me(client, user_credentials):
    res = client.post("/api/auth/register", json=user_credentials)
    assert res.status_code == 200

    login_res = client.post(
        "/api/auth/login",
        json={"email": user_credentials["email"], "password": user_credentials["password"]},
    )
    assert login_res.status_code == 200
    token = login_res.json().get("access_token")
    assert token

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json().get("email") == user_credentials["email"]
