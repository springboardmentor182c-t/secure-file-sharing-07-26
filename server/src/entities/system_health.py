class SystemHealth(Base):
    __tablename__="system_health"

    id = Column(Integer, primary_key=True, index=True)
    api_response_time = Column(String)
    database_load = Column(String)
    storage_io = Column(String)
    active_connections = Column(Integer)
    cpu_usage = Column(String)
    error_rate = Column(String)
    system_health = Column(String)
    storage_limit = Column(String)