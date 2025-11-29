package com.yousef.ignite.service.security;

import com.yousef.ignite.dto.request.ChangePasswordDTO;
import com.yousef.ignite.dto.request.LoginRequestDTO;
import com.yousef.ignite.dto.request.RegisterRequestDTO;
import com.yousef.ignite.dto.response.LoginResponseDTO;
import com.yousef.ignite.dto.response.RegisterResponseDTO;
import com.yousef.ignite.entity.User;
import com.yousef.ignite.exception.custom.EmailAlreadyExistsException;
import com.yousef.ignite.exception.custom.InvalidTokenException;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnverifiedEmailException;


public interface AuthService {

    /**
     * Register a new customer
     *
     * @param customer the customer to be registered
     * @return the registered customer
     * @throws EmailAlreadyExistsException if the customer already exists
     */

    RegisterResponseDTO register(RegisterRequestDTO customer) throws EmailAlreadyExistsException;


    /**
     * Login a customer
     *
     * @param loginRequestDTO login details
     * @return login response @{@link LoginResponseDTO}
     * @throws ResourceNotFoundException if entered email doesn't exist
     * @throws UnverifiedEmailException if email isn't yet verified
     */

    LoginResponseDTO login(LoginRequestDTO loginRequestDTO) throws ResourceNotFoundException, UnverifiedEmailException;


    /**
     * Sends an email to verify the user
     *
     * @param user , the user to be verified
     */

    void sendVerificationEmail(User user);


    /**
     *
     * @param token the token of confirmation
     * @return confirmation message
     * @throws InvalidTokenException if the token doesn't match
     */
    String confirmEmail(String token) throws InvalidTokenException;

    /**
     * Logout a customer
     *
     * @param token the token of the user
     */
    void logout(String token);


    void deleteUser(String token, Long userId);


    void forgotPassword(String email);

    String resetPassword(String token, ChangePasswordDTO request);


}