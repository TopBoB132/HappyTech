package com.hospital.healthhandwash;

import com.google.firebase.database.PropertyName;

public class IsSharedHWTFB
{
    private String key;
    Boolean isShared;

    public IsSharedHWTFB() {}

    public IsSharedHWTFB(String key, Boolean isShared)
    {
        this.key = key;
        this.isShared = isShared;
    }

    public String getKey() {return this.key;}
    @PropertyName("isShared")
    public Boolean isShared() {return this.isShared;}
}
