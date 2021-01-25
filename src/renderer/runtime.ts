import { ipcBackend } from './ipc'
import { RC_Config, BasicWebRTCOptions } from '../shared/shared-types'
import { setLogHandler } from '../shared/logger'
import type { dialog, app } from 'electron'
import { basename, join } from 'path'

const {
  openExternal,
  openPath,
  write_clipboard_text,
  read_clipboard_text,
  app_getPath,
} = window.electron_functions

/**
 * Offers an abstaction Layer to make it easier to make browser client in the future
 */
interface Runtime {
  /**
   * initializes runtime stuff
   * - sets the LogHandler
   * - event listeners on runtime events
   */
  initialize(): void
  reloadWebContent(): void
  openLogFile(): void
  getCurrentLogLocation(): string
  openHelpWindow(): void
  openCallWindow(options: BasicWebRTCOptions): void
  updateBadge(): void
  /**
   * get the comandline arguments
   */
  getRC_Config(): RC_Config
  /**
   * Opens a link in a new Window or in the Browser
   * @param link
   */
  openLink(link: string): void
  showOpenFileDialog(
    options: Electron.OpenDialogOptions
  ): Promise<string | null>
  downloadFile(pathToFile: string): Promise<void>
  transformBlobURL(blob: string): string
  readClipboardText(): Promise<string>
  writeClipboardText(text: string): Promise<void>
  getAppPath(name: Parameters<typeof app.getPath>[0]): string
}

class Browser implements Runtime {
  getAppPath(name: string): string {
    throw new Error("Method not implemented.")
  }
  downloadFile(_pathToFile: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async readClipboardText(): Promise<string> {
    // return await navigator.clipboard.readText
    throw new Error('Method not implemented.')
  }
  writeClipboardText(_text: string): Promise<void> {
    // navigator.clipboard.writeText(text)
    throw new Error('Method not implemented.')
  }
  transformBlobURL(_blob: string): string {
    throw new Error('Method not implemented.')
  }
  async showOpenFileDialog(
    _options: Electron.OpenDialogOptions
  ): Promise<string> {
    throw new Error('Method not implemented.')
  }
  openCallWindow(_options: BasicWebRTCOptions): void {
    throw new Error('Method not implemented.')
  }
  openLink(_link: string): void {
    throw new Error('Method not implemented.')
  }
  initialize(): void {
    throw new Error('Method not implemented.')
  }
  getRC_Config(): RC_Config {
    throw new Error('Method not implemented.')
  }
  updateBadge(): void {
    throw new Error('Method not implemented.')
  }
  openHelpWindow(): void {
    throw new Error('Method not implemented.')
  }
  openLogFile(): void {
    throw new Error('Method not implemented.')
  }
  getCurrentLogLocation(): string {
    return 'not implemented.'
  }
  reloadWebContent(): void {
    window.location.reload()
  }
}
class Electron implements Runtime {
  getAppPath(name: Parameters<Runtime["getAppPath"]>[0]): string {
    return app_getPath(name)
  }
  async downloadFile(pathToFile: string): Promise<void> {
    await ipcBackend.invoke('saveFile', pathToFile, {
      defaultPath: join(app_getPath('downloads'), basename(pathToFile)),
    })
  }
  readClipboardText(): Promise<string> {
    return Promise.resolve(read_clipboard_text())
  }
  writeClipboardText(text: string): Promise<void> {
    return Promise.resolve(write_clipboard_text(text))
  }
  private rc_config: RC_Config = null
  transformBlobURL(blob: string): string {
    return 'dc-blob://' + blob.substring(blob.indexOf('accounts') + 9)
  }
  async showOpenFileDialog(
    options: Electron.OpenDialogOptions
  ): Promise<string> {
    const { filePaths } = await (<ReturnType<typeof dialog.showOpenDialog>>(
      ipcBackend.invoke('fileChooser', options)
    ))
    return filePaths && filePaths[0]
  }
  async openCallWindow(options: BasicWebRTCOptions): Promise<void> {
    const optionString = Object.keys(options)
      .map((key: keyof BasicWebRTCOptions) => key + '=' + options[key])
      .join('&')
    ipcBackend.send('call', window.localeData.locale, optionString)
  }
  openLink(link: string): void {
    openExternal(link)
  }
  getRC_Config(): RC_Config {
    if (!this.rc_config) {
      this.rc_config = ipcBackend.sendSync('get-rc-config')
    }
    return this.rc_config
  }
  initialize() {
    setLogHandler((...args: any[]) => {
      ipcBackend.send(
        'handleLogMessage',
        ...args.map(arg => {
          // filter args to be make sure electron doesn't give an object clone error (Error: An object could not be cloned)
          if (typeof arg === 'object') {
            // make sure objects are clean of unsupported types
            return JSON.parse(JSON.stringify(arg))
          } else if (typeof arg === 'function') {
            return arg.toString()
          } else {
            return arg
          }
        })
      )
    }, this.getRC_Config())
    ipcBackend.on('showHelpDialog', this.openHelpWindow)
  }
  openHelpWindow(): void {
    ipcBackend.send('help', window.localeData.locale)
  }
  openLogFile(): void {
    openPath(this.getCurrentLogLocation())
  }
  getCurrentLogLocation(): string {
    return ipcBackend.sendSync('get-log-path')
  }
  reloadWebContent(): void {
    ipcBackend.send('reload-main-window')
  }
  updateBadge() {
    ipcBackend.send('update-badge')
  }
}

const IS_ELECTRON = true

export const runtime: Runtime = IS_ELECTRON ? new Electron() : new Browser()
;(window as any).r = runtime
