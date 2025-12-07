const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const https = require('https');

class MusicCard {
	constructor() {
		this.fontsLoaded = false;
	}

	/* ---------------- FONT LOADER (ONLINE) ---------------- */

	async registerFonts() {
		if (this.fontsLoaded) return;

		try {
			const fonts = [
				{
					name: 'Work Sans',
					weight: '400',
					url: 'https://fonts.gstatic.com/s/worksans/v18/QGYsz_wNahGAdqQ43Rh_fKDp.woff2',
				},
				{
					name: 'Work Sans SemiBold',
					weight: '600',
					url: 'https://fonts.gstatic.com/s/worksans/v18/QGYsz_wNahGAdqQ43Rh3fKDp.woff2',
				},
				{
					name: 'Work Sans Bold',
					weight: '700',
					url: 'https://fonts.gstatic.com/s/worksans/v18/QGYsz_wNahGAdqQ43RhxfKDp.woff2',
				},
			];

			for (const font of fonts) {
				const buffer = await this.fetchFont(font.url);
				GlobalFonts.registerFromBuffer(buffer, font.name);
			}

			this.fontsLoaded = true;
			console.log('[MusicCard] Work Sans fonts loaded from Google Fonts ✅');
		} catch (err) {
			console.error('[MusicCard] Failed to load Work Sans. Falling back.', err);
		}
	}

	fetchFont(url) {
		return new Promise((resolve, reject) => {
			https.get(url, (res) => {
				const data = [];
				res.on('data', (chunk) => data.push(chunk));
				res.on('end', () => resolve(Buffer.concat(data)));
			}).on('error', reject);
		});
	}

	/* ---------------- UI HELPERS ---------------- */

	createFrostedGlass(ctx, x, y, width, height, radius = 15) {
		ctx.save();
		ctx.beginPath();
		ctx.roundRect(x, y, width, height, radius);
		ctx.clip();
		ctx.fillStyle = 'rgba(20, 25, 40, 0.4)';
		ctx.fillRect(x, y, width, height);
		ctx.restore();
	}

	truncateText(ctx, text, maxWidth, font, ellipsis = '...') {
		ctx.font = font;
		if (ctx.measureText(text).width <= maxWidth) return text;
		while (ctx.measureText(text + ellipsis).width > maxWidth) {
			text = text.slice(0, -1);
		}
		return text + ellipsis;
	}

	formatDuration(ms) {
		if (!ms || ms < 0) return '0:00';
		const s = Math.floor((ms / 1000) % 60).toString().padStart(2, '0');
		const m = Math.floor(ms / 60000).toString();
		return `${m}:${s}`;
	}

	/* ---------------- ARTWORK ---------------- */

	async drawArtwork(ctx, track, x, y, size) {
		try {
			const url = track?.info?.artworkUrl || track?.pluginInfo?.artworkUrl;
			if (!url) throw new Error('No artwork');

			const img = await loadImage(url);
			ctx.save();
			ctx.beginPath();
			ctx.roundRect(x, y, size, size, 18);
			ctx.clip();
			ctx.drawImage(img, x, y, size, size);
			ctx.restore();
		} catch {
			this.createFrostedGlass(ctx, x, y, size, size, 18);
		}
	}

	/* ---------------- MAIN CARD ---------------- */

	async generateNowPlayingCard({ track, position = 0 }) {
		await this.registerFonts();

		const width = 780;
		const height = 260;
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext('2d');

		// Background
		ctx.fillStyle = '#0f1320';
		ctx.fillRect(0, 0, width, height);

		const margin = 30;
		const artworkSize = 180;
		await this.drawArtwork(ctx, track, margin, margin, artworkSize);

		const infoX = margin + artworkSize + 30;
		const maxW = width - infoX - margin;
		let y = margin + 15;

		// Source
		ctx.font = '18px "Work Sans"';
		ctx.fillStyle = '#a0b0c0';
		ctx.fillText(
			`Playing from ${track?.info?.sourceName || 'Unknown'}`,
			infoX,
			y,
		);

		// Title
		y += 30;
		ctx.font = '38px "Work Sans Bold"';
		ctx.fillStyle = '#ffffff';
		const title = this.truncateText(
			ctx,
			track?.info?.title || 'Unknown Title',
			maxW,
			ctx.font,
		);
		ctx.fillText(title, infoX, y);

		// Artist
		y += 48;
		ctx.font = '26px "Work Sans SemiBold"';
		ctx.fillStyle = '#e0e8f0';
		const artist = this.truncateText(
			ctx,
			track?.info?.author || 'Unknown Artist',
			maxW,
			ctx.font,
		);
		ctx.fillText(artist, infoX, y);

		// Time
		y += 40;
		ctx.font = '18px "Work Sans"';
		ctx.fillStyle = '#a0b0c0';
		ctx.fillText(
			`${this.formatDuration(position)} / ${this.formatDuration(
				track?.info?.duration,
			)}`,
			infoX,
			y,
		);

		// Footer
		ctx.textAlign = 'right';
		ctx.font = '16px "Work Sans SemiBold"';
		ctx.fillText('Dragon Tune', width - margin, height - 30);

		return canvas.toBuffer('image/png');
	}
}

module.exports = { MusicCard };
