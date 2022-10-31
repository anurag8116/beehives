package com.ascent.recon.impl;

import java.io.Serializable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.ascent.recon.BaseService;
import com.ascent.recon.core.audit.util.AuditEventPublisher;
import com.ascent.recon.core.common.AppUser;
import com.ascent.recon.core.common.Role;
import com.ascent.recon.core.common.RoleName;
import com.ascent.recon.core.common.dao.BaseDao;
import com.ascent.recon.core.validation.BeanValidator;

@Transactional
public class BaseServiceImpl implements BaseService {

	@Autowired
	private BaseDao baseDao;

	@Autowired
	private BeanValidator beanValidator;

	@Autowired
	protected AuditEventPublisher eventPublisher;

	@Override
	public void setBaseDao(BaseDao baseDao) {
		this.baseDao = baseDao;
	}

	@Override
	public <T> T save(T entity) {
		T saved = baseDao.save(entity);
		return saved;
	}

	@Override
	public <T> T update(T entity) {
		return baseDao.update(entity);
	}

	@Override
	public <T> T saveOrUpdate(T entity) {
		return baseDao.saveOrUpdate(entity);
	}

	@Override
	public <T> void delete(T entity) {
		baseDao.delete(entity);
	}

	@Override
	@Transactional(readOnly = true)
	public <T> T getById(Class<T> entityClass, Serializable id) {
		return baseDao.getById(entityClass, id);
	}

	@Override
	public void flush() {
		this.baseDao.flush();
	}

	@Override
	public void clear() {
		this.baseDao.clear();
	}

	protected <T> void validate(final T model, Class<?>... groups) {
		this.beanValidator.validate(model, groups);
	}

	@Override
	public void setSessionReadOnly() {
		this.baseDao.setSessionReadOnly();
	}

	@Override
	public RoleName getLoggedInUserRoleName() {
		RoleName roleName = baseDao.getLoggedInUserRoleName();
		return roleName;
	}

	@Override
	public AppUser getLoggedInUser() {
		AppUser appUser = baseDao.getLoggedInUser();
		return appUser;
	}

	@Override
	public Role getLoggedInUserRoleEntity() {
		Role role = baseDao.getLoggedInUserRole();
		return role;
	}

}
