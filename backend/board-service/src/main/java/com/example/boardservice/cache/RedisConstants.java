package com.example.boardservice.cache;

import java.time.Duration;

public final class RedisConstants {
    public static final String USER_PROFILE_KEY = "user:profile:%d";
    public static final Duration USER_PROFILE_TTL = Duration.ofHours(1);

    public static final String USER_ROLE_KEY = "user:%d:project:%d";
    public static final Duration USER_ROLE_TTL = Duration.ofMinutes(5);

    public static final String ROLE_PERMS_KEY = "role:%d:permissions";
    public static final Duration ROLE_PERMS_TTL = Duration.ofMinutes(10);

    public static final String INVITE_TOKEN_KEY = "invite:token:%s";
    public static final Duration INVITE_TOKEN_TTL = Duration.ofDays(1);

    public static final String ROLE_IS_OWNER_KEY = "role:%d:isOwner";
    public static final Duration ROLE_IS_OWNER_TTL = Duration.ofMinutes(10);

    private RedisConstants() {}
}