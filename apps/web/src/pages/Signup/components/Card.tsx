import { ReactNode } from "react";

interface Props {
    className: string;
    children: ReactNode;
}

function Card({ className, children }: Props) {
    return <div className={className}>{children}</div>;
}

export default Card;
