

import appRootPath from 'app-root-path'
import { resolve } from 'path';


export const appRoot = appRootPath.toString()

export const logPath = resolve(appRoot, 'logs')