package lk.ijse.gdse71.smartclassroombackend.repository;

import lk.ijse.gdse71.smartclassroombackend.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, String> {
}
