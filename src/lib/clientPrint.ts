"use client";

function cleanupFrame(frame: HTMLIFrameElement) {
    window.setTimeout(() => {
        frame.remove();
    }, 1000);
}

export function printHtmlContent(html: string) {
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.setAttribute("aria-hidden", "true");

    document.body.appendChild(frame);

    const frameDocument = frame.contentDocument;

    if (!frameDocument) {
        cleanupFrame(frame);
        return;
    }

    frame.onload = () => {
        const frameWindow = frame.contentWindow;

        if (!frameWindow) {
            cleanupFrame(frame);
            return;
        }

        frameWindow.focus();
        frameWindow.print();
        cleanupFrame(frame);
    };

    frameDocument.open();
    frameDocument.write(html);
    frameDocument.close();
}

export function printFileUrl(fileUrl: string) {
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.setAttribute("aria-hidden", "true");

    frame.onload = () => {
        const frameWindow = frame.contentWindow;

        if (!frameWindow) {
            cleanupFrame(frame);
            return;
        }

        window.setTimeout(() => {
            frameWindow.focus();
            frameWindow.print();
            cleanupFrame(frame);
        }, 700);
    };

    frame.src = fileUrl;
    document.body.appendChild(frame);
}
