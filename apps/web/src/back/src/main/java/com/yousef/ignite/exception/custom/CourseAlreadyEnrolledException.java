package com.yousef.ignite.exception.custom;

public class CourseAlreadyEnrolledException extends RuntimeException {
    public CourseAlreadyEnrolledException(String message) {
        super(message);
    }
}
