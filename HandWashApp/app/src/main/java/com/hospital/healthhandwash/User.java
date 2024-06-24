package com.hospital.healthhandwash;

import com.google.firebase.database.PropertyName;

public class User
{
    private String email, username, whatJob;
    private boolean isManager, isSharedHWT;

    public User() {}

    public User(String email, boolean isManager, boolean isSharedHWT, String username, String whatJob)
    {
        this.email = email;
        this.isManager = isManager;
        this.isSharedHWT = isSharedHWT;
        this.username = username;
        this.whatJob = whatJob;
    }

    public String getEmail() {return email;}

    @PropertyName("isManager")
    public boolean isManager() {return isManager;}

    @PropertyName("isSharedHWT")
    public boolean isSharedHWT() {return isSharedHWT;}

    public String getUsername() {return username;}

    public String getWhatJob() {return whatJob;}
}

