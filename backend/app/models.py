from sqlalchemy import Column, Integer, String, Text, Date, Time, TIMESTAMP, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    telefone = Column(String(20))
    cpf = Column(String(14), unique=True)
    criado_em = Column(TIMESTAMP, server_default=func.now())
    is_admin = Column(Boolean, default=False)


class Evento(Base):
    __tablename__ = "eventos"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    descricao = Column(Text)
    data = Column(Date, nullable=False)
    local = Column(String(150))


class Palestra(Base):
    __tablename__ = "palestras"
    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text)
    palestrante = Column(String(150), nullable=False)
    horario_inicio = Column(Time, nullable=False)
    horario_fim = Column(Time, nullable=False)


class Minicurso(Base):
    __tablename__ = "minicursos"
    id = Column(Integer, primary_key=True, index=True)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text)
    carga_horaria = Column(Integer, nullable=False)
    horario_inicio = Column(Time, nullable=False)
    horario_fim = Column(Time, nullable=False)
    video_url = Column(String(255))


class InscricaoEvento(Base):
    __tablename__ = "inscricoes_evento"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    evento_id = Column(Integer, ForeignKey("eventos.id"), nullable=False)
    data_inscricao = Column(TIMESTAMP, server_default=func.now())
    assento = Column(String(5), unique=True)


class InscricaoPalestra(Base):
    __tablename__ = "inscricoes_palestra"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    palestra_id = Column(Integer, ForeignKey("palestras.id"), nullable=False)
    inscrito_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    data_inscricao = Column(TIMESTAMP, server_default=func.now())


class InscricaoMinicurso(Base):
    __tablename__ = "inscricoes_minicurso"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    minicurso_id = Column(Integer, ForeignKey("minicursos.id"), nullable=False)
    inscrito_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    data_inscricao = Column(TIMESTAMP, server_default=func.now())
    presente = Column(Boolean, default=False)


class Certificado(Base):
    __tablename__ = "certificados"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    tipo = Column(String(20), nullable=False)
    referencia_id = Column(Integer, nullable=False)
    carga_horaria = Column(Integer, nullable=False)
    data_emissao = Column(TIMESTAMP, server_default=func.now())
    codigo_verificacao = Column(String(50), unique=True, nullable=False)