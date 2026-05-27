package com.yousef.ignite.exception.custom;

public class JobApplicationAlreadyExists extends RuntimeException {
    public JobApplicationAlreadyExists(String message) {
        super(message);
    }
}
