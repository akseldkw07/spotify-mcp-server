import assert from 'node:assert/strict';
import test from 'node:test';
import { connect, mockHttp } from './helpers.js';

// The same presets as mcp-utils (all four hints always set). Claude Desktop
// runs read-only tools without asking and asks before destructive ones.
const READ = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};
const WRITE = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: false,
  openWorldHint: true,
};
const DESTRUCTIVE = { ...WRITE, destructiveHint: true };

const expected = {
  searchSpotify: READ,
  getNowPlaying: READ,
  getMyPlaylists: READ,
  getPlaylistTracks: READ,
  getRecentlyPlayed: READ,
  getUsersSavedTracks: READ,
  getQueue: READ,
  getAvailableDevices: READ,
  getTopTracks: READ,
  getTopArtists: READ,
  getFollowedArtists: READ,
  getAlbums: READ,
  getAlbumTracks: READ,
  checkUsersSavedAlbums: READ,
  getPlaylist: READ,

  playMusic: WRITE,
  pausePlayback: WRITE,
  resumePlayback: WRITE,
  skipToNext: WRITE,
  skipToPrevious: WRITE,
  addToQueue: WRITE,
  setVolume: WRITE,
  adjustVolume: WRITE,
  createPlaylist: WRITE,
  addTracksToPlaylist: WRITE,
  reorderPlaylistItems: WRITE,

  // Deletes, or overwrites what was there (updatePlaylist replaces the name
  // and description and can make a playlist public).
  removeUsersSavedTracks: DESTRUCTIVE,
  saveOrRemoveAlbumForUser: DESTRUCTIVE,
  updatePlaylist: DESTRUCTIVE,
  removeTracksFromPlaylist: DESTRUCTIVE,
  unfollowPlaylist: DESTRUCTIVE,
};

test('every tool carries the full set of annotation hints', async (t) => {
  mockHttp(t, []);
  const client = await connect(t);
  const { tools } = await client.listTools();
  assert.deepEqual(
    Object.fromEntries(tools.map((tool) => [tool.name, tool.annotations])),
    expected,
  );
});
