// js/modals/playlist/add-to-playlist-modal.js
// Add song to playlist modal functionality

class AddToPlaylistModal extends BaseModal {
    async show(songId) {
        try {
            ModalUtils.showLoading('Loading...', 'Fetching playlists');
            
            const [playlists, song] = await Promise.all([
                database.playlists.getAll(),
                database.music.getById(songId)
            ]);
            
            ModalUtils.closeLoading();

            if (!song) {
                ModalUtils.showError('Error', 'Song not found');
                return;
            }

            if (!playlists || playlists.length === 0) {
                ModalUtils.showInfo('No Playlists', 'Create a playlist first!');
                return;
            }

            this.showPlaylistSelector(songId, song, playlists);
            
        } catch (error) {
            this.handleError(error, 'Failed to load data');
        }
    }

    async showPlaylistSelector(songId, song, playlists) {
        const playlistOptions = await this.getPlaylistOptions(songId, playlists);
        
        this.swal.fire({
            title: '<i class="fas fa-plus-circle"></i> Add to Playlist',
            html: this.getSelectorHTML(song, playlistOptions),
            showCancelButton: true,
            confirmButtonText: '<i class="fas fa-save"></i> Update Playlists',
            cancelButtonText: '<i class="fas fa-times"></i> Cancel',
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                return await this.handleSelection(songId, playlistOptions);
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                ModalUtils.showToast(
                    `✅ Updated ${result.value.count} playlist(s) for "${result.value.song}"`,
                    'success'
                );
                
                if (window.playlistsManager) {
                    playlistsManager.loadPlaylistsTable();
                }
            }
        });
    }

    async getPlaylistOptions(songId, playlists) {
        return await Promise.all(playlists.map(async (playlist) => {
            const songIds = await database.playlistSongs.getPlaylistSongIds(playlist.id);
            return {
                ...playlist,
                isInPlaylist: songIds.includes(songId)
            };
        }));
    }

    getSelectorHTML(song, playlistOptions) {
        const playlistListHtml = playlistOptions.map(playlist => `
            <div class="playlist-option" data-id="${playlist.id}">
                <label style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-bottom: 1px solid #eee; cursor: pointer;">
                    <input type="checkbox" ${playlist.isInPlaylist ? 'checked' : ''} style="width: 18px; height: 18px;">
                    <div class="playlist-option-content" style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                        <i class="fas fa-list-music" style="color: #6c757d; font-size: 1.2rem;"></i>
                        <div style="display: flex; flex-direction: column;">
                            <strong>${ModalUtils.escapeHtml(playlist.name)}</strong>
                            <small style="color: #6c757d;">${ModalUtils.escapeHtml(playlist.description || 'No description')}</small>
                            ${playlist.isInPlaylist ? 
                                '<small style="color: #28a745;"><i class="fas fa-check"></i> Already in playlist</small>' : 
                                ''}
                        </div>
                    </div>
                </label>
            </div>
        `).join('');

        return `
            <div class="sweet-form">
                <p style="margin-bottom: 1rem; padding: 0.5rem; background: #f8f9fa; border-radius: 8px;">
                    <i class="fas fa-music"></i> <strong>"${ModalUtils.escapeHtml(song.title)}"</strong> by ${ModalUtils.escapeHtml(song.artist)}
                </p>
                <p style="font-weight: bold; margin-bottom: 0.5rem;">Select playlists:</p>
                <div class="playlist-selector" style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 8px;">
                    ${playlistListHtml}
                </div>
            </div>
        `;
    }

    async handleSelection(songId, playlistOptions) {
        const selectedPlaylists = [];
        document.querySelectorAll('.playlist-option input:checked').forEach(input => {
            const playlistDiv = input.closest('.playlist-option');
            if (playlistDiv) {
                const playlistId = parseInt(playlistDiv.dataset.id);
                if (!isNaN(playlistId)) {
                    selectedPlaylists.push(playlistId);
                }
            }
        });

        for (const playlist of playlistOptions) {
            try {
                if (selectedPlaylists.includes(playlist.id) && !playlist.isInPlaylist) {
                    await database.playlistSongs.addSongToPlaylist(songId, playlist.id);
                } else if (!selectedPlaylists.includes(playlist.id) && playlist.isInPlaylist) {
                    await database.playlistSongs.removeSongFromPlaylist(songId, playlist.id);
                }
            } catch (error) {
                console.warn(`Failed to update playlist ${playlist.id}:`, error);
            }
        }

        return {
            success: true,
            song: playlistOptions[0]?.name || 'Song',
            count: selectedPlaylists.length
        };
    }
}

window.AddToPlaylistModal = AddToPlaylistModal;