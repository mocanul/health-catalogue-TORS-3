import { Suspense } from "react";
import CataloguePage from "./cataloguePage";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CataloguePage />
        </Suspense>
    );
}