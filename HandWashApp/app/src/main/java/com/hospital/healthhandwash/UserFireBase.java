package com.hospital.healthhandwash;

public class UserFireBase
{
    private String uid, username;

    public UserFireBase() {}

    public UserFireBase(String uid, String username)
    {
        this.uid = uid;
        this.username = username;
    }

    public String getUid() {return this.uid;}
    public String getUsername() {return this.username;}
}
