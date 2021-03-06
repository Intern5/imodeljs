/*---------------------------------------------------------------------------------------------
* Copyright (c) 2019 Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
/** @module Schema */

import { ActivityLoggingContext, DbResult, Logger, AuthStatus } from "@bentley/bentleyjs-core";
import { AccessToken } from "@bentley/imodeljs-clients";
import { IModelError } from "@bentley/imodeljs-common";
import { ClassRegistry } from "../ClassRegistry";
import { IModelDb } from "../IModelDb";
import { Schema, Schemas } from "../Schema";
import * as elementsModule from "./FunctionalElements";

/** @hidden */
const loggingCategory = "imodeljs-backend.Functional";

export class Functional extends Schema {
  public static registerSchema() {
    Schemas.unregisterSchema(Functional.name);
    Schemas.registerSchema(new Functional());
  }
  private constructor() {
    super();
    ClassRegistry.registerModule(elementsModule, this);
  }
  public static async importSchema(activityLoggingContext: ActivityLoggingContext, iModelDb: IModelDb, accessToken?: AccessToken) {
    // NOTE: this concurrencyControl logic was copied from IModelDb.importSchema
    activityLoggingContext.enter();
    if (!iModelDb.briefcase.isStandalone) {
      if (!accessToken)
        throw new IModelError(AuthStatus.Error, "Importing the schema requires the accessToken of the authorized user");
      await iModelDb.concurrencyControl.lockSchema(activityLoggingContext, accessToken);
      activityLoggingContext.enter();
    }
    const stat = iModelDb.briefcase.nativeDb.importFunctionalSchema();
    if (DbResult.BE_SQLITE_OK !== stat) {
      throw new IModelError(stat, "Error importing Functional schema", Logger.logError, loggingCategory);
    }
    // FunctionalDomain (C++) does not create Category or other Elements on import
  }
}
