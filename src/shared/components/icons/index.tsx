import { History, Inbox, SearchX, Settings } from 'lucide-react'

export const OkiLogo = ({
  size = 36,
  className,
  ...props
}: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="210 135 600 600"
      width={size}
      height={size}
      className={`fill-foreground ${className ?? ''}`}
      {...props}
    >
      <path d="M507.679016,633.758789 C484.728058,647.358337 461.953094,660.542053 439.471100,674.207581 C405.766968,694.694397 366.854065,674.473389 360.024109,637.347717 C358.592224,629.564392 358.882172,621.410828 358.873810,613.427368 C358.792725,535.939514 358.817169,458.451508 358.811951,380.963531 C358.811920,380.463623 358.713379,379.936066 358.836884,379.467865 C361.488953,369.415039 358.178925,360.808929 353.753571,351.758331 C343.139801,330.051270 338.545654,306.583588 335.476318,282.721497 C333.982819,271.110626 333.468719,259.539490 333.681763,247.891907 C333.779755,242.533371 334.757782,237.296799 336.901947,232.363220 C339.395325,226.626205 343.862396,224.580017 349.913971,226.290298 C358.448975,228.702438 365.242401,234.215866 372.349121,239.120667 C380.877197,245.006485 388.424469,252.079605 395.835052,259.279388 C398.120789,261.500092 400.219238,262.289001 403.375977,260.840790 C418.127808,254.073181 433.667847,250.852966 449.894562,251.707886 C454.765259,251.964493 457.071625,250.038437 458.693909,245.686279 C464.364471,230.473434 471.752533,216.161240 481.895905,203.372864 C490.748962,192.211243 499.859222,192.460480 507.907501,204.409058 C516.222168,216.753174 520.160461,230.933167 524.000671,245.057449 C529.378357,264.836426 532.661499,285.040039 532.871887,305.523254 C533.070007,324.816895 529.528503,343.600403 520.823303,361.048889 C519.035706,364.631836 519.673035,366.172638 522.969727,368.084167 C558.556641,388.718597 594.078979,409.464508 629.564697,430.272736 C632.573120,432.036804 634.585510,431.855621 636.800842,429.088531 C648.295959,414.730164 648.897217,398.993744 642.642456,382.520477 C638.318176,371.131592 631.002869,361.579102 622.695129,352.851471 C614.656982,344.407013 606.034424,336.516235 598.053772,328.020386 C585.527344,314.685272 577.299744,298.845886 575.006836,280.730469 C570.115601,242.086411 592.248657,212.162674 628.600647,207.040756 C658.362793,202.847336 686.370544,220.967026 692.720764,247.534882 C697.073853,265.747406 689.506470,285.598999 674.066162,294.893494 C668.749573,298.093903 663.072510,299.702393 656.928894,297.338409 C651.400024,295.210938 648.665161,291.240295 648.663391,285.546722 C648.661621,279.886322 651.849121,274.886444 656.752380,272.858246 C666.202332,268.949341 669.482971,261.453674 665.575317,251.967087 C661.475098,242.012878 653.407410,236.546341 643.270142,234.602554 C620.484253,230.233429 598.777588,249.675644 600.423828,272.818542 C601.387329,286.363190 608.190674,297.412109 616.622437,307.533447 C627.192322,320.221344 640.048645,330.740845 650.720947,343.361420 C661.675781,356.316132 669.937500,370.508575 672.498779,387.537018 C675.194763,405.461334 673.059448,422.663086 664.566162,438.870056 C664.102600,439.754608 663.752563,440.728271 663.149536,441.505096 C659.863342,445.738861 660.880920,448.157684 665.467834,451.146729 C680.277405,460.797424 687.626770,474.768829 688.434509,492.567841 C689.507263,516.205933 679.204712,533.128723 659.233887,544.835205 C617.282898,569.426025 575.334900,594.022034 533.388367,618.620483 C524.914856,623.589478 516.453186,628.578613 507.679016,633.758789 M460.347626,563.777466 C491.329803,545.506348 522.303040,527.220093 553.299377,508.972992 C562.997070,503.264130 567.846863,492.267609 553.259583,484.087189 C537.286926,475.129852 521.631348,465.605682 505.867279,456.278198 C487.236755,445.254669 468.640686,434.172943 450.024353,423.125366 C442.965881,418.936676 437.244385,419.829437 432.306244,425.719238 C429.411621,429.171692 429.052795,433.208099 429.064941,437.453552 C429.175415,476.103210 429.243042,514.752991 429.324554,553.402771 C429.328766,555.401794 429.251556,557.406677 429.373352,559.398926 C429.944183,568.735291 439.636353,574.788330 448.030579,570.849182 C452.082275,568.947876 455.828156,566.394897 460.347626,563.777466 M382.604462,322.942444 C379.154205,325.022614 380.347565,327.589661 381.837738,330.195618 C391.856506,347.716034 414.870605,348.753845 426.477448,332.186768 C427.582550,330.609436 429.411133,328.915131 427.968475,326.867401 C426.158936,324.298920 423.226501,323.170227 420.205353,322.920624 C417.688232,322.712677 417.841125,325.217316 417.199951,326.813263 C414.993561,332.305054 410.477692,335.451874 404.957397,335.340393 C399.569580,335.231567 395.576843,332.193909 393.484802,326.611938 C391.137695,320.349426 390.272369,320.005768 382.604462,322.942444 M455.186462,318.653137 C453.887054,319.657776 452.398804,320.482758 451.798889,322.140778 C457.540741,329.901581 468.968994,332.611389 478.714935,328.556824 C489.482147,324.077332 498.048218,311.922913 496.554047,303.189178 C496.086975,300.458984 494.741730,299.207214 491.671814,299.810669 C484.902344,301.141296 484.433289,301.568787 484.546600,308.620667 C484.646057,314.811340 481.209991,320.001129 475.826477,321.791473 C470.912933,323.425507 466.579803,321.587158 462.692596,316.246796 C462.322388,315.738159 461.836487,315.313751 461.456055,314.905762 C458.973602,315.329407 457.609924,317.201233 455.186462,318.653137 M426.121002,371.579102 C435.394989,375.140686 440.774658,369.673126 445.645508,362.752228 C451.373199,366.614838 457.179962,368.699524 463.223419,364.057098 C466.190704,361.777649 468.736755,359.110931 468.493988,354.309906 C465.864105,355.349091 463.951965,356.446594 461.904327,356.841461 C457.845154,357.624176 453.320984,358.682587 449.874573,356.005249 C446.969513,353.748505 450.176239,350.546234 450.362976,347.739960 C450.384766,347.412262 450.519897,347.090729 450.531006,346.763885 C450.589020,345.056793 449.672760,344.106079 448.074829,344.578644 C444.042267,345.771149 439.568909,345.833496 436.067108,348.789703 C436.375488,349.431427 436.500732,349.933197 436.802094,350.283447 C442.526428,356.936890 441.960205,359.379059 433.810760,363.426910 C431.074982,364.785797 428.243347,365.423370 425.173828,365.421143 C423.513245,365.419952 421.540771,364.470795 420.007904,366.483398 C420.982086,369.030243 423.258575,370.092621 426.121002,371.579102 z" />
    </svg>
  )
}

export const SearchIcon = ({
  size = 24,
  strokeWidth = 1.5,
  width,
  height,
  ...props
}: {
  size?: number
  strokeWidth?: number
  width?: number
  height?: number
}) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={height || size}
      role="presentation"
      viewBox="0 0 24 24"
      width={width || size}
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

export const RecentIcon = ({
  size = 36,
  className,
  ...props
}: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) => (
  <History size={size} className={className} {...props} />
)

export const SettingIcon = ({
  size = 36,
  className,
  ...props
}: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) => (
  <Settings size={size} className={className} {...props} />
)

// SettingsModal 中使用的图标
export const CheckIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export const CircleCheckIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

export const LinkIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  )
}

export const TagIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  )
}

export const TrashIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

export const ServerIcon = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  )
}

export const PackageIcon = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 17v1a3 3 0 006 0v-1m3-7V7a3 3 0 00-3-3H9a3 3 0 00-3 3v3m3 7h6a3 3 0 003-3v-1a3 3 0 00-3-3H9a3 3 0 00-3 3v1a3 3 0 003 3z"
      />
    </svg>
  )
}

export const CheckCircleIcon = ({
  size = 20,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" width={size} height={size} {...props}>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export const CloseIcon = ({
  size = 20,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      height={size}
      role="presentation"
      viewBox="0 0 1024 1024"
      width={size}
      {...props}
    >
      <path d="M597.795527 511.488347 813.564755 295.718095c23.833825-23.833825 23.833825-62.47489 0.001023-86.307691-23.832801-23.832801-62.47489-23.833825-86.307691 0L511.487835 425.180656 295.717583 209.410404c-23.833825-23.833825-62.475913-23.833825-86.307691 0-23.832801 23.832801-23.833825 62.47489 0 86.308715l215.769228 215.769228L209.410915 727.258599c-23.833825 23.833825-23.833825 62.47489 0 86.307691 23.832801 23.833825 62.473867 23.833825 86.307691 0l215.768205-215.768205 215.769228 215.769228c23.834848 23.833825 62.475913 23.832801 86.308715 0 23.833825-23.833825 23.833825-62.47489 0-86.307691L597.795527 511.488347z"></path>
    </svg>
  )
}

export const NoItemIcon = ({
  size = 36,
  className,
  ...props
}: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) => (
  <Inbox
    size={size}
    className={`text-muted-foreground ${className ?? ''}`}
    strokeWidth={1}
    {...props}
  />
)

export const NoResultIcon = ({
  size = 36,
  className,
  ...props
}: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) => (
  <SearchX
    size={size}
    className={`text-muted-foreground ${className ?? ''}`}
    strokeWidth={1}
    {...props}
  />
)

export const DownloadIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  )
}

export const UploadIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  )
}

export const CodeIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  )
}

export const GlobeIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

export const ArrowUpIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )
}

export const ArrowDownIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export const ChevronDownIcon = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  )
}
