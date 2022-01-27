package com.sample.constant;

import java.time.format.DateTimeFormatter;

public class webConstant {

    public static final String SERVICE_KEY = "FYzIvgpwksCXlv54%2BMN8wG8Nk84RTr5AdA%2FBqJq%2BoEDXoQMblY8%2FsP%2Ftp7m0UYQ7YmFCGU7GhBKv33a4PVWAZA%3D%3D";



    /**
     * 날짜 포맷 (yyyy-MM-dd HH:mm:ss)
     */
    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");


    /**
     * 날짜 포맷 (yyyyMMdd)
     */
    public static final DateTimeFormatter DATE_FORMATTER_YMD = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * 날짜 포맷 (yyyyMMdd)
     */
    public static final DateTimeFormatter DATE_FORMATTER_HHmm = DateTimeFormatter.ofPattern("HHmm");

}
