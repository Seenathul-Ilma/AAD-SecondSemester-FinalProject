package lk.ijse.gdse71.smartclassroombackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * --------------------------------------------
 * Author: Zeenathul Ilma
 * GitHub: https://github.com/Seenathul-Ilma
 * Website: https://zeenathulilma.vercel.app/
 * --------------------------------------------
 * Created: 9/6/2025 12:47 PM
 * Project: AAD-SecondSemester-FinalProject
 * --------------------------------------------
 **/

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${announcement.upload.dir}")
    private String announcementDir;

    @Value("${submission.upload.dir}")
    private String submissionDir;

    @Value("${materials.upload.dir}")
    private String materialsDir;

    @Value("${assignments.upload.dir}")
    private String assignmentsDir;

    @Value("${profile.upload.dir}")
    private String profileDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Announcements
        registry.addResourceHandler("/announcements/**")
                .addResourceLocations("file:" + announcementDir + "/");

        // Materials
        registry.addResourceHandler("/materials/**")
                .addResourceLocations("file:" + materialsDir + "/");

        // Assignments
        registry.addResourceHandler("/assignments/**")
                .addResourceLocations("file:" + assignmentsDir + "/");

        registry.addResourceHandler("/submissions/**")
                .addResourceLocations("file:" + submissionDir + "/");

        // Profiles
        registry.addResourceHandler("/profiles/**")
                .addResourceLocations("file:" + profileDir + "/");
    }
}


