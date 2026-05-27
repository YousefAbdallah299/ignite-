package com.yousef.ignite.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SuspendUserRequestDTO {
    @NotNull(message = "Suspended status is required")
    private Boolean suspended;
}

