import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AuthService } from "../services/auth.service.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const signup = asyncHandler(async (req, res) => {
    const user = await AuthService.signup(req.body);
    return res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
    const deviceInfo = req.headers["user-agent"];
    const { user, accessToken, refreshToken } = await AuthService.login({
        ...req.body,
        deviceInfo,
    });

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user, accessToken },
                "Login successful"
            )
        );
});

export const refresh = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    const { accessToken, refreshToken } = await AuthService.refreshAccessToken(incomingRefreshToken);

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { accessToken },
                "Access token refreshed successfully"
            )
        );
});

export const logout = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (req.user?.id) {
        await AuthService.logout(incomingRefreshToken, req.user.id);
    }

    return res
        .status(200)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});
