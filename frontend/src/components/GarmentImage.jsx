import { useEffect, useState } from "react";
import { recolorGarment } from "../utils/smartRecolor";

export default function GarmentImage({
    src,
    alt,
    className,
    targetColor,
    style,
    ...props
}) {
    const [displaySrc, setDisplaySrc] = useState(src);

    useEffect(() => {
        let isCurrent = true;

        if (!src) {
            setDisplaySrc("/product-placeholder.png");
            return;
        }

        if (!targetColor) {
            setDisplaySrc(src);
            return;
        }

        recolorGarment(src, targetColor).then(resultUrl => {
            if (isCurrent && resultUrl) {
                setDisplaySrc(resultUrl);
            }
        });

        return () => {
            isCurrent = false;
        };
    }, [src, targetColor]);

    return (
        <img
            src={displaySrc}
            alt={alt}
            className={className}
            style={style}
            {...props}
        />
    );
}
