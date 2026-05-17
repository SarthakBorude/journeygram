package com.srtk.journeygram.repository;

import com.srtk.journeygram.model.LocationCache;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LocationCacheRepository extends JpaRepository<LocationCache, Long> {
    Optional<LocationCache> findByLocationNameAndDestination(String locationName, String destination);
}
