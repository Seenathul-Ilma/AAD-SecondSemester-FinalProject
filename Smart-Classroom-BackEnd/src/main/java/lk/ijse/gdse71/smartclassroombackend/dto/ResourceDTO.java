package lk.ijse.gdse71.smartclassroombackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 8/28/2025 7:01 AM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ResourceDTO {

    private String resourceId;   // Generated in impl (not user-provided)

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 5, max = 500, message = "Description must be between 5 and 500 characters")
    private String description;

    @Pattern(
            regexp = "^(?:[a-zA-Z0-9_\\-/\\\\:.]+)?$",
            message = "Invalid file path format"
    )
    private String filePath;

    @Pattern(
            regexp = "^(pdf|docx?|pptx?|xlsx?|txt|csv|rtf|odt|md|jpg|jpeg|png|gif|mp3|mp4|zip|rar|7z|tar|gz)$",
            message = "Invalid file type. Allowed: pdf, doc, docx, ppt, pptx, xls, xlsx, txt, csv, rtf, odt, md, jpg, jpeg, png, gif, mp3, mp4, zip, rar, 7z, tar, gz"
    )
    private String fileType;

    @PastOrPresent(message = "Upload date cannot be in the future")
    private LocalDateTime uploadedAt;

    @PastOrPresent(message = "Update date cannot be in the future")
    private LocalDateTime updatedAt;

    @NotBlank(message = "Uploader ID is required")
    private String uploadedBy;   // userId, teacherId

    @NotBlank(message = "Target classroom ID is required")
    private String uploadedTo;   // classroomId
}