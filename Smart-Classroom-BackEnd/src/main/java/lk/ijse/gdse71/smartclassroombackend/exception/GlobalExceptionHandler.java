package lk.ijse.gdse71.smartclassroombackend.exception;

import lk.ijse.gdse71.smartclassroombackend.util.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/24/2025 11:29 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Add exception handling logics here
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDeniedException(AccessDeniedException e){
        return new ResponseEntity<>(new ApiResponse(
                403,
                e.getMessage(),
                null
        ), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGenericException(Exception e){
        return new ResponseEntity<>(new ApiResponse(
                500,   // bcz, server side error
                e.getMessage(),
                null
        ),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFoundException(ResourceNotFoundException e){
        return new ResponseEntity<>(new ApiResponse(
                404,
                e.getMessage(),
                null
        ),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(ResourceDuplicateException.class)
    public ResponseEntity<ApiResponse> handleResourceDuplicateException(ResourceDuplicateException e){
        return new ResponseEntity<>(new ApiResponse(
                409,
                e.getMessage(),
                null
        ),
                HttpStatus.CONFLICT
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e){
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(fieldError -> {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        });

        return new ResponseEntity<>(new ApiResponse(
                400,
                "Validation Failed",
                errors
        ),
                HttpStatus.BAD_REQUEST
        );

    }

}

