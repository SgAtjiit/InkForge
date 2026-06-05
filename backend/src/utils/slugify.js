import crypto from "crypto";

export const generateSlug = (title) => {
    const slugified = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const randomSuffix = crypto.randomBytes(3).toString("hex");
    return `${slugified}-${randomSuffix}`;
};
