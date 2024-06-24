package com.hospital.healthhandwash;

public class HandWashTimesFireBase
{
    private String key;
    int HWT;

    public HandWashTimesFireBase() {}

    public HandWashTimesFireBase(String key, int HWT)
    {
        this.key = key;
        this.HWT = HWT;
    }

    public String getEmailName() {return this.key;}
    public int getHWT() {return this.HWT;}
}
