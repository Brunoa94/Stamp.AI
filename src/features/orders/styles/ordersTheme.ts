export const ordersCardTheme = {
    card: `glass-card p-8 rounded-lg flex-grow`,
    header: `flex justify-between items-center mb-8`,
    viewAll:
        `text-xs font-bold uppercase tracking-widest text-[#7C3AED] hover:underline`,
    item:
        `flex items-center gap-6 p-4 bg-white/40 rounded-lg border border-white/50 hover:border-[#7C3AED]/30 transition-all group`,
    itemImageWrap:
        `w-20 h-20 bg-white/60 rounded-lg flex-shrink-0 flex items-center justify-center relative`,
    itemImage:
        `w-14 h-14 object-contain group-hover:scale-110 transition-transform`,
    itemTitle:
        `font-heading font-bold text-sm md:text-lg uppercase text-gray-900`,
    itemMeta: `text-xs text-gray-500 font-medium mb-3`,
    itemPrice: `text-sm font-bold text-gray-900`,
    statusBadge:
        `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase`,
    statusPending: `bg-slate-100 text-slate-600 ring-1 ring-slate-200`,
    statusProcessing: `bg-amber-50 text-amber-700 ring-1 ring-amber-200`,
    statusShipped: `bg-sky-50 text-sky-700 ring-1 ring-sky-200`,
    statusInTransit: `bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200`,
    statusDelivered: `bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200`,
    statusCancelled: `bg-red-50 text-red-600 ring-1 ring-red-200`,
    statusRefunded: `bg-purple-50 text-purple-700 ring-1 ring-purple-200`,
    statusFailed: `bg-rose-50 text-rose-700 ring-1 ring-rose-200`,
    statusOnHold: `bg-orange-50 text-orange-700 ring-1 ring-orange-200`,
    emptyState: `text-sm text-gray-500`,
} as const;

export const ordersPageTheme = {
    header: {
        container: `mb-10`,
        title:
            `text-6xl md:text-8xl font-heading text-slate-900 leading-none mb-4`,
        decorativeRow: `flex items-center gap-4`,
        decorativeLine:
            `h-1.5 w-24 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full`,
        subtitle: `text-slate-400 font-light italic font-accent`,
    },
    filters: {
        container:
            `glass-card rounded-xl px-8 py-5 mb-8 border border-white/60 flex flex-wrap lg:flex-nowrap items-center gap-x-12 gap-y-4`,
        timeframeLabel:
            `text-xs md:text-sm font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap`,
        selectWrapper: `relative min-w-[160px]`,
        select:
            `w-full px-4 py-2.5 bg-white/50 border border-slate-400 rounded text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#7C3AED]/20 outline-none appearance-none cursor-pointer`,
        statusLabel:
            `text-xs md:text-sm font-bold text-slate-600 uppercase tracking-widest mr-2`,
        chipBase:
            `px-4 py-2 rounded-lg text-sm font-bold border border-slate-200 hover:border-[#7C3AED] transition-all`,
        chipActive:
            `px-4 py-2 rounded-lg text-sm font-bold border border-[#7C3AED] bg-[#7C3AED] text-white`,
    },
    table: {
        container:
            `glass-card rounded-xl overflow-hidden border border-white/60`,
        table: `w-full`,
        thead: `bg-slate-50/50 border-b border-slate-200`,
        th: `px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest`,
        thRight:
            `px-8 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-widest`,
        tbody: `divide-y divide-slate-100`,
        row: `order-row transition-colors hover:bg-[#7C3AED]/[0.03]`,
        cell: `px-8 py-8`,
        orderNumber: `text-base font-bold text-slate-900`,
        orderDate: `text-sm text-slate-400 mt-1`,
        itemsStack: `flex -space-x-3 overflow-hidden`,
        itemImage:
            `inline-block h-14 w-14 rounded-lg ring-2 ring-white object-cover bg-slate-100`,
        itemBadge:
            `inline-flex items-center justify-center h-14 w-14 rounded-lg bg-slate-800 text-white text-xs font-bold ring-2 ring-white`,
        statusBadge:
            `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase`,
        statusPending: `bg-slate-100 text-slate-600 ring-1 ring-slate-200`,
        statusProcessing: `bg-amber-50 text-amber-700 ring-1 ring-amber-200`,
        statusShipped: `bg-sky-50 text-sky-700 ring-1 ring-sky-200`,
        statusInTransit: `bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200`,
        statusDelivered:
            `bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200`,
        statusCancelled: `bg-red-50 text-red-600 ring-1 ring-red-200`,
        statusRefunded: `bg-purple-50 text-purple-700 ring-1 ring-purple-200`,
        statusFailed: `bg-rose-50 text-rose-700 ring-1 ring-rose-200`,
        statusOnHold: `bg-orange-50 text-orange-700 ring-1 ring-orange-200`,
        total: `text-base font-bold text-slate-900`,
        actions: `flex items-center justify-end gap-3`,
        viewButton:
            `px-5 py-2.5 bg-[#7C3AED] text-white text-sm font-bold rounded hover:bg-[#6D28D9] transition-all`,
        reorderButton:
            `px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all`,
        moreActionsTrigger:
            `h-8 px-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 rounded-md`,
        moreActionsRow: `bg-slate-50/70`,
        moreActionsCell: `whitespace-normal! px-8 pt-0 pb-6`,
        moreActionsPanel:
            `mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.4)]`,
        moreActionsButton:
            `h-9 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700 hover:border-[#7C3AED]/40 hover:text-[#7C3AED]`,
    },
    pagination: {
        container:
            `px-8 py-6 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between -mt-4 pt-8 -z-1 rounded-lg`,
        info: `text-xs text-slate-400 font-medium font-accent italic`,
        controls: `flex items-center gap-2`,
        button:
            `w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50`,
        pageButton:
            `w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-xs text-slate-600 hover:border-[#7C3AED] transition-all`,
        pageButtonActive:
            `w-8 h-8 flex items-center justify-center rounded bg-[#7C3AED] text-white text-xs font-bold`,
    },
    mobileCard: {
        container:
            `glass-card rounded-xl overflow-hidden p-5 border border-white/60`,
        header: `flex justify-between items-start mb-2`,
        orderNumber: `font-bold text-slate-900 text-sm`,
        orderDate: `text-[10px] text-slate-400 mt-0.5`,
        infoRow:
            `flex items-center justify-between py-2 border-y border-slate-100/50`,
        itemsStack: `flex -space-x-4 overflow-hidden`,
        priceText: `font-bold text-slate-900 text-base leading-none mb-1`,
        itemCount: `text-xs font-bold text-slate-400 uppercase tracking-tight`,
        deliveryWrap: `flex items-center gap-1.5 mt-0.5`,
        deliveryText: `text-xs text-slate-500 font-medium italic`,
        actions: `grid grid-cols-2 gap-1 mt-3`,
        viewButton:
            `h-11 bg-[#7C3AED] text-white text-[10px] font-bold rounded-lg active:scale-95 transition-all uppercase tracking-widest`,
        reorderButton:
            `h-11 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg active:scale-95 transition-all uppercase tracking-widest`,
    },
    mobileFilters: {
        container:
            `glass-card rounded-xl p-5 mb-6 space-y-4 border border-white/60 md:hidden`,
        sectionLabel:
            `text-[10px] font-bold text-slate-600 uppercase tracking-widest block mb-2`,
        selectWrapper: `relative`,
        select:
            `w-full px-4 py-2 bg-white/50 border border-slate-400 rounded text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#7C3AED]/20 outline-none appearance-none cursor-pointer`,
        chipsRow:
            `flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x`,
        chipBase:
            `shrink-0 snap-start px-4 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 bg-white/50`,
        chipActive:
            `shrink-0 snap-start px-4 py-1.5 rounded-lg text-[10px] font-bold border bg-[#7C3AED] text-white border-[#7C3AED]`,
    },
    mobilePagination: {
        container:
            `mt-4 flex items-center justify-between glass-card rounded-xl p-2.5 md:hidden`,
        info: `text-[10px] text-slate-400 font-medium italic`,
        controls: `flex items-center gap-2`,
        navButton:
            `w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 disabled:opacity-50`,
        pageButtonActive:
            `w-8 h-8 flex items-center justify-center rounded bg-[#7C3AED] text-white text-[10px] font-bold`,
        pageButton:
            `w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-[10px] text-slate-600`,
    },
    sideBorders: {
        container: `flowing-border-container`,
        left: `side-border-left hidden xl:block`,
        right: `side-border-right hidden xl:block`,
    },
} as const;

export const ordersLoadingTheme = {
    container: `space-y-10`,
    headerRow: `flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-6`,
    titleStack: `space-y-4`,
    titleLine: `h-1.5 w-20`,
    title: `h-16 md:h-20 w-64 md:w-80`,
    subtitle: `h-4 w-56 md:w-80`,
    controlsWrap: `flex items-center gap-2 border border-ink/10 p-1 bg-white`,
    controlButton: `h-12 w-12`,
    filtersRow: `flex flex-wrap gap-4 mb-2`,
    filterPill: `h-10 w-24 md:w-32 rounded-lg`,
    list: `space-y-6`,
    card: `border border-ink/10 bg-white p-6 lg:p-10`,
    cardGrid: `flex flex-col gap-10 lg:grid lg:grid-cols-[200px_1fr] lg:gap-10 items-start`,
    image: `h-[200px] w-full lg:w-[200px] rounded-none`,
    content: `w-full space-y-8`,
    topRow: `flex flex-col gap-4 md:flex-row md:items-center md:justify-between`,
    titleBlock: `space-y-2`,
    cardTitle: `h-10 w-56`,
    cardMeta: `h-3 w-40`,
    status: `h-7 w-28 rounded-full`,
    statsGrid: `grid grid-cols-2 gap-8 border-y border-ink/5 py-6 md:grid-cols-4`,
    statLabel: `h-3 w-16`,
    statValue: `h-5 w-20`,
    actionsRow: `flex flex-wrap gap-4 pt-2`,
    actionPrimary: `h-10 w-36 rounded-md`,
    actionSecondary: `h-10 w-36 rounded-md`,
    actionDestructive: `h-10 w-24 rounded-md`,
} as const;
