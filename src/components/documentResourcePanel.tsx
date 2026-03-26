"use client";

import { printFileUrl } from "@/lib/clientPrint";

type ResourceItem = {
    title: string;
    viewHref: string;
    downloadHref: string;
};

type DocumentResourcePanelProps = {
    title: string;
    description: string;
    items: ResourceItem[];
};

export default function DocumentResourcePanel({
    title,
    description,
    items,
}: DocumentResourcePanelProps) {
    return (
        <section className="relative z-0 rounded-3xl border border-white/70 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <div className="border-b border-pink-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="mt-2 text-gray-600">{description}</p>
            </div>

            <div className="mt-6 space-y-4">
                {items.map((item) => (
                    <article
                        key={item.title}
                        className="rounded-2xl border border-pink-100 bg-[linear-gradient(135deg,_rgba(255,255,255,1)_0%,_rgba(252,244,248,1)_100%)] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Open the latest reference copy, print it for room prep, or download it locally.
                                </p>
                            </div>
                            <span className="inline-flex w-fit rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink-900">
                                PDF
                            </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <a
                                href={item.viewHref}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md border border-pink-200 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:border-pink-300 hover:bg-pink-50"
                            >
                                View
                            </a>
                            <button
                                type="button"
                                onClick={() => printFileUrl(item.viewHref)}
                                className="rounded-md border border-pink-200 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:border-pink-300 hover:bg-pink-50"
                            >
                                Print
                            </button>
                            <a
                                href={item.downloadHref}
                                download
                                className="rounded-md border border-pink-200 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:border-pink-300 hover:bg-pink-50"
                            >
                                Download
                            </a>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
