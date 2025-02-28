/*
 * DBeaver - Universal Database Manager
 * Copyright (C) 2010-2022 DBeaver Corp
 *
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of DBeaver Corp and its suppliers, if any.
 * The intellectual and technical concepts contained
 * herein are proprietary to DBeaver Corp and its suppliers
 * and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from DBeaver Corp.
 */

package io.cloudbeaver.service.rm;

import io.cloudbeaver.server.CBApplication;
import org.jkiss.dbeaver.DBException;
import org.jkiss.dbeaver.model.DBPHiddenObject;
import org.jkiss.dbeaver.model.DBPImage;
import org.jkiss.dbeaver.model.app.DBPProject;
import org.jkiss.dbeaver.model.auth.SMCredentialsProvider;
import org.jkiss.dbeaver.model.auth.SMSession;
import org.jkiss.dbeaver.model.navigator.DBNNode;
import org.jkiss.dbeaver.model.navigator.DBNProject;
import org.jkiss.dbeaver.model.rm.RMController;
import org.jkiss.dbeaver.model.rm.RMProject;
import org.jkiss.dbeaver.model.runtime.DBRProgressMonitor;

import java.util.ArrayList;
import java.util.List;

public class DBNResourceManagerRoot extends DBNNode implements DBPHiddenObject {

    private DBNResourceManagerProject[] projects;
    private RMController resourceController;

    DBNResourceManagerRoot(DBNProject parentNode) {
        super(parentNode);
    }

    public RMController getResourceController() {
        return resourceController;
    }

    @Override
    public String getNodeType() {
        return "rm";
    }

    @Override
    public String getNodeName() {
        return "resources";
    }

    @Override
    public String getNodeDescription() {
        return "Resources";
    }

    @Override
    public DBPImage getNodeIcon() {
        return null;
    }

    @Override
    protected boolean allowsChildren() {
        return true;
    }

    @Override
    public DBNResourceManagerProject[] getChildren(DBRProgressMonitor monitor) throws DBException {
        if (projects == null) {
            DBPProject dbProject = ((DBNProject) getParentNode()).getProject();
            SMSession session = dbProject.getSessionContext().getSpaceSession(monitor, dbProject, false);
            if (!(session instanceof SMCredentialsProvider)) {
                throw new DBException("Can't obtain credentials provider for resource manager");
            }
            List<DBNResourceManagerProject> projectNodes = new ArrayList<>();
            resourceController = CBApplication.getInstance().getResourceController((SMCredentialsProvider) session);
            for (RMProject project : resourceController.listAccessibleProjects()) {
                projectNodes.add(new DBNResourceManagerProject(this, project));
            }

            projects = projectNodes.toArray(new DBNResourceManagerProject[0]);
        }
        return projects;
    }

    @Override
    public String getNodeItemPath() {
        // Path doesn't include project name
        return NodePathType.ext.getPrefix() + getNodeName();
    }

    @Override
    public DBNNode refreshNode(DBRProgressMonitor monitor, Object source) throws DBException {
        projects = null;
        return this;
    }

    @Override
    public String toString() {
        return getNodeName();
    }

    @Override
    public boolean isHidden() {
        return true;
    }
}
