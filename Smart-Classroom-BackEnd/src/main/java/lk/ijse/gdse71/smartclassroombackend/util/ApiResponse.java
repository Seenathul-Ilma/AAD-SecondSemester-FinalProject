package lk.ijse.gdse71.smartclassroombackend.util;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/24/2025 11:27 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Data
@AllArgsConstructor
public class ApiResponse {
    private int status;
    private String message;
    private Object data;
}

