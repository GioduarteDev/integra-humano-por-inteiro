from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/admin", tags=["Administração"])


# ---------- Gerenciar Minicursos ----------

@router.post("/minicursos", response_model=schemas.MinicursoOut)
def criar_minicurso(
    dados: schemas.MinicursoCreate,
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    novo = models.Minicurso(
        evento_id=1,
        titulo=dados.titulo,
        descricao=dados.descricao,
        carga_horaria=dados.carga_horaria,
        horario_inicio=dados.horario_inicio,
        horario_fim=dados.horario_fim,
        video_url=dados.video_url,
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@router.put("/minicursos/{minicurso_id}", response_model=schemas.MinicursoOut)
def editar_minicurso(
    minicurso_id: int,
    dados: schemas.MinicursoUpdate,
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    minicurso = db.query(models.Minicurso).filter(models.Minicurso.id == minicurso_id).first()
    if not minicurso:
        raise HTTPException(status_code=404, detail="Minicurso não encontrado")

    dados_atualizados = dados.dict(exclude_unset=True)
    for campo, valor in dados_atualizados.items():
        setattr(minicurso, campo, valor)

    db.commit()
    db.refresh(minicurso)
    return minicurso


@router.delete("/minicursos/{minicurso_id}")
def apagar_minicurso(
    minicurso_id: int,
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    minicurso = db.query(models.Minicurso).filter(models.Minicurso.id == minicurso_id).first()
    if not minicurso:
        raise HTTPException(status_code=404, detail="Minicurso não encontrado")

    db.delete(minicurso)
    db.commit()
    return {"mensagem": "Minicurso removido com sucesso"}


# ---------- Gerenciar Participantes ----------

@router.get("/participantes")
def listar_participantes(
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    usuarios = db.query(models.Usuario).all()
    resultado = []
    for u in usuarios:
        qtd_minicursos = db.query(models.InscricaoMinicurso).filter(
            models.InscricaoMinicurso.usuario_id == u.id
        ).count()
        qtd_palestras = db.query(models.InscricaoPalestra).filter(
            models.InscricaoPalestra.usuario_id == u.id
        ).count()
        resultado.append({
            "id": u.id,
            "nome": u.nome,
            "email": u.email,
            "cpf": u.cpf,
            "telefone": u.telefone,
            "is_admin": u.is_admin,
            "qtd_minicursos": qtd_minicursos,
            "qtd_palestras": qtd_palestras,
        })
    return resultado


@router.get("/participantes/{usuario_id}/inscricoes")
def ver_inscricoes_participante(
    usuario_id: int,
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    minicursos = db.query(models.InscricaoMinicurso).filter(
        models.InscricaoMinicurso.usuario_id == usuario_id
    ).all()
    palestras = db.query(models.InscricaoPalestra).filter(
        models.InscricaoPalestra.usuario_id == usuario_id
    ).all()

    return {
        "usuario": {"id": usuario.id, "nome": usuario.nome, "email": usuario.email},
        "minicursos": [
            {"minicurso_id": i.minicurso_id, "presente": i.presente} for i in minicursos
        ],
        "palestras": [
            {"palestra_id": i.palestra_id} for i in palestras
        ],
    }
# ---------- Cadastrar participante manualmente ----------
@router.post("/participantes", response_model=schemas.UsuarioOut)
def cadastrar_participante(
    dados: schemas.UsuarioCreate,
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    existente = db.query(models.Usuario).filter(models.Usuario.email == dados.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    cpf_existente = db.query(models.Usuario).filter(models.Usuario.cpf == dados.cpf).first()
    if cpf_existente:
        raise HTTPException(status_code=400, detail="Este CPF já está cadastrado")

    novo_usuario = models.Usuario(
        nome=dados.nome,
        email=dados.email,
        senha_hash=auth.hash_senha(dados.senha),
        telefone=dados.telefone,
        cpf=dados.cpf,
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario
# ---------- Apagar conta de participante (completo) ----------
@router.delete("/participantes/{usuario_id}")
def apagar_participante(
    usuario_id: int,
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if usuario.is_admin:
        raise HTTPException(status_code=400, detail="Não é possível apagar uma conta de administrador")

    # Remove tudo que referencia esse usuário, antes de apagar ele
    db.query(models.Certificado).filter(models.Certificado.usuario_id == usuario_id).delete()
    db.query(models.InscricaoMinicurso).filter(
        (models.InscricaoMinicurso.usuario_id == usuario_id) |
        (models.InscricaoMinicurso.inscrito_por_id == usuario_id)
    ).delete()
    db.query(models.InscricaoPalestra).filter(
        (models.InscricaoPalestra.usuario_id == usuario_id) |
        (models.InscricaoPalestra.inscrito_por_id == usuario_id)
    ).delete()
    db.query(models.InscricaoEvento).filter(models.InscricaoEvento.usuario_id == usuario_id).delete()

    db.delete(usuario)
    db.commit()
    return {"mensagem": "Participante removido com sucesso"}


# ---------- Remover participante de um minicurso específico ----------
@router.delete("/minicursos/{minicurso_id}/participantes/{usuario_id}")
def remover_de_minicurso(
    minicurso_id: int,
    usuario_id: int,
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    inscricao = db.query(models.InscricaoMinicurso).filter(
        models.InscricaoMinicurso.minicurso_id == minicurso_id,
        models.InscricaoMinicurso.usuario_id == usuario_id,
    ).first()
    if not inscricao:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada")

    db.delete(inscricao)
    db.commit()
    return {"mensagem": "Participante removido do minicurso"}


# ---------- Remover participante de uma palestra específica ----------
@router.delete("/palestras/{palestra_id}/participantes/{usuario_id}")
def remover_de_palestra(
    palestra_id: int,
    usuario_id: int,
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    inscricao = db.query(models.InscricaoPalestra).filter(
        models.InscricaoPalestra.palestra_id == palestra_id,
        models.InscricaoPalestra.usuario_id == usuario_id,
    ).first()
    if not inscricao:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada")

    db.delete(inscricao)
    db.commit()
    return {"mensagem": "Participante removido da palestra"}
@router.post("/minicursos/{minicurso_id}/inscrever")
def inscrever_participante_admin(
    minicurso_id: int,
    dados: schemas.InscreverPorContato,
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    if not dados.email and not dados.cpf:
        raise HTTPException(status_code=400, detail="Informe email ou CPF")

    usuario = None
    if dados.email:
        usuario = db.query(models.Usuario).filter(models.Usuario.email == dados.email).first()
    if not usuario and dados.cpf:
        usuario = db.query(models.Usuario).filter(models.Usuario.cpf == dados.cpf).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Participante não encontrado")

    minicurso = db.query(models.Minicurso).filter(models.Minicurso.id == minicurso_id).first()
    if not minicurso:
        raise HTTPException(status_code=404, detail="Minicurso não encontrado")

    ja_inscrito = db.query(models.InscricaoMinicurso).filter(
        models.InscricaoMinicurso.minicurso_id == minicurso_id,
        models.InscricaoMinicurso.usuario_id == usuario.id,
    ).first()
    if ja_inscrito:
        raise HTTPException(status_code=400, detail="Este participante já está inscrito")

    nova = models.InscricaoMinicurso(
        usuario_id=usuario.id,
        minicurso_id=minicurso_id,
        inscrito_por_id=admin.id,
    )
    db.add(nova)
    db.commit()
    return {"mensagem": f"{usuario.nome} inscrito(a) com sucesso"}
@router.get("/estatisticas")
def estatisticas_dashboard(
    admin: models.Usuario = Depends(auth.usuario_admin),
    db: Session = Depends(get_db),
):
    total_participantes = db.query(models.Usuario).count()
    total_minicursos = db.query(models.Minicurso).count()
    total_palestras = db.query(models.Palestra).count()
    total_inscritos_evento = db.query(models.InscricaoEvento).count()
    total_inscritos_minicurso = db.query(models.InscricaoMinicurso).count()
    total_inscritos_palestra = db.query(models.InscricaoPalestra).count()
    total_certificados = db.query(models.Certificado).count()
    total_presentes = db.query(models.InscricaoMinicurso).filter(
        models.InscricaoMinicurso.presente == True
    ).count()
    total_assentos_escolhidos = db.query(models.InscricaoEvento).filter(
        models.InscricaoEvento.assento.isnot(None)
    ).count()

    return {
        "total_participantes": total_participantes,
        "total_minicursos": total_minicursos,
        "total_palestras": total_palestras,
        "total_inscritos_evento": total_inscritos_evento,
        "total_inscritos_minicurso": total_inscritos_minicurso,
        "total_inscritos_palestra": total_inscritos_palestra,
        "total_certificados": total_certificados,
        "total_presentes": total_presentes,
        "total_assentos_escolhidos": total_assentos_escolhidos,
    }