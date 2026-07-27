type ClientLogoProps = {
  name: string;
  className?: string;
};

const SVG_PROPS = {
  viewBox: "0 0 24 24",
  role: "img" as const,
  fill: "currentColor",
  "aria-hidden": true,
};

export function ClientLogo({ name, className }: ClientLogoProps) {
  const cls = className ?? "h-8 w-auto";

  switch (name) {
    case "2K Games":
      return (
        <svg {...SVG_PROPS} className={cls} xmlns="http://www.w3.org/2000/svg">
          <title>2K</title>
          <path d="M0 .002v23.997h24V.002H0Zm10.962 5.592c2.36 0 4.443.416 3.799 2.423-.434 1.365-2.017 1.918-3.114 2.109l-2.757.489c-.655.114-1.039.277-1.3.549h6.012l-.818 2.529 3.446-2.529h3.755l-4.091 2.772 2.07 4.402h-3.766l-1.082-2.754-1.197.826-.619 1.928H8.471l1.718-5.374h-6.25C4.874 10.2 6.891 9.36 8.731 8.989l2.264-.457c.387-.07.64-.259.736-.557.136-.416-.32-.581-.994-.581-.784 0-1.604.074-1.984 1.005H5.646c1.009-2.474 3.483-2.805 5.316-2.805Z" />
        </svg>
      );
    case "Netflix Original Series":
      return (
        <svg {...SVG_PROPS} className={cls} xmlns="http://www.w3.org/2000/svg">
          <title>Netflix</title>
          <path d="m5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398zm8.489 0v9.172l4.715 13.33V0h-4.715zM5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398V14.83L5.398 1.5z" />
        </svg>
      );
    case "SpaceX Art Initiative":
      return (
        <svg {...SVG_PROPS} className={cls} xmlns="http://www.w3.org/2000/svg">
          <title>SpaceX</title>
          <path d="M24 7.417C8.882 8.287 1.89 14.75.321 16.28L0 16.583h2.797C10.356 9.005 21.222 7.663 24 7.417zm-17.046 6.35c-.472.321-.945.68-1.398 1.02l2.457 1.796h2.778zM2.948 10.8H.189l3.25 2.381c.473-.321 1.02-.661 1.512-.945Z" />
        </svg>
      );
    case "Stellar Foundation":
      return (
        <svg {...SVG_PROPS} className={cls} xmlns="http://www.w3.org/2000/svg">
          <title>Stellar</title>
          <path d="M12.003 1.716c-1.37 0-2.7.27-3.948.78A10.18 10.18 0 0 0 2.66 7.901a10.136 10.136 0 0 0-.797 3.954c0 .258.01.516.027.775a1.942 1.942 0 0 1-1.055 1.88L0 14.934v1.902l2.463-1.26.072-.032v.005l.77-.39.758-.385.066-.039 14.807-7.56 1.666-.847 3.392-1.732V2.694L17.792 5.86 3.744 13.025l-.104.055-.017-.115a8.286 8.286 0 0 1-.071-1.105c0-2.255.88-4.377 2.474-5.977a8.462 8.462 0 0 1 2.71-1.82 8.513 8.513 0 0 1 3.2-.654h.067a8.41 8.41 0 0 1 4.09 1.055l1.628-.83.126-.066a10.11 10.11 0 0 0-5.845-1.853zM24 7.143 5.047 16.808l-1.666.847L0 19.382v1.902l3.282-1.671 2.91-1.485 14.058-7.153.105-.055.016.115c.05.369.072.743.072 1.11 0 2.255-.88 4.383-2.475 5.978a8.461 8.461 0 0 1-2.71 1.82 8.305 8.305 0 0 1-3.2.654h-.06c-1.441 0-2.86-.369-4.102-1.061l-.066.033-1.683.857c.594.418 1.232.776 1.903 1.062a10.11 10.11 0 0 0 3.947.797 10.09 10.09 0 0 0 7.17-2.975 10.136 10.136 0 0 0 2.969-7.18c0-.259-.005-.523-.027-.781a1.942 1.942 0 0 1 1.055-1.88L24 9.044z" />
        </svg>
      );
    default:
      return null;
  }
}

export const CLIENTS_WITH_LOGO = new Set([
  "2K Games",
  "Netflix Original Series",
  "SpaceX Art Initiative",
  "Stellar Foundation",
]);
