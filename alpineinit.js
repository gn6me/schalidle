    Alpine.data('searchlist', () => ({
        search: '',
        open: false,
        toggle() {
            this.open = ! this.open
        }
        students: ['shiro', 'saya', 'aru'],
        get filteredItems() {
            return this.items.filter(
                i => i.startsWith(this.search)
            )
        }
    }))
