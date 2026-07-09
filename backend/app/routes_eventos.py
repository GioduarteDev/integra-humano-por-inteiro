from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(tags=["Eventos"])


# ---------- Listagens (públicas ou logadas, simples) ----------
@router.get("/eventos", response_model=list[schemas.EventoOut])
def listar_eventos(db: Session = Depends(get_db)):
    return db.query(models.Evento).all()

@router.get("/eventos/{evento_id}/contagem")
def contar_inscritos(evento_id: int, db: Session = Depends(get_db)):
    total = db.query(models.InscricaoEvento).filter(
        models.InscricaoEvento.evento_id == evento_id
    ).count()
    return {"total": total} 
@router.get("/palestras", response_model=list[schemas.PalestraOut])
def listar_palestras(db: Session = Depends(get_db)):
    return db.query(models.Palestra).all()


@router.get("/minicursos", response_model=list[schemas.MinicursoOut])
def listar_minicursos(db: Session = Depends(get_db)):
    return db.query(models.Minicurso).all()


# ---------- Inscrição em evento ----------
@router.post("/inscricoes/evento")
def inscrever_evento(
    dados: schemas.InscricaoEventoCreate,
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    evento = db.query(models.Evento).filter(models.Evento.id == dados.evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento não encontrado")

    ja_inscrito = db.query(models.InscricaoEvento).filter(
        models.InscricaoEvento.usuario_id == usuario_atual.id,
        models.InscricaoEvento.evento_id == dados.evento_id,
    ).first()
    if ja_inscrito:
        raise HTTPException(status_code=400, detail="Você já está inscrito neste evento")

    nova = models.InscricaoEvento(usuario_id=usuario_atual.id, evento_id=dados.evento_id)
    db.add(nova)
    db.commit()
    return {"mensagem": "Inscrição no evento realizada com sucesso"}


# ---------- Inscrição em palestra (própria ou de terceiro) ----------
@router.post("/inscricoes/palestra")
def inscrever_palestra(
    dados: schemas.InscricaoPalestraCreate,
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    palestra = db.query(models.Palestra).filter(models.Palestra.id == dados.palestra_id).first()
    if not palestra:
        raise HTTPException(status_code=404, detail="Palestra não encontrada")

    usuario_id_alvo = dados.usuario_id or usuario_atual.id

    if dados.usuario_id:
        alvo = db.query(models.Usuario).filter(models.Usuario.id == dados.usuario_id).first()
        if not alvo:
            raise HTTPException(status_code=404, detail="Usuário a ser inscrito não encontrado")

    ja_inscrito = db.query(models.InscricaoPalestra).filter(
        models.InscricaoPalestra.usuario_id == usuario_id_alvo,
        models.InscricaoPalestra.palestra_id == dados.palestra_id,
    ).first()
    if ja_inscrito:
        raise HTTPException(status_code=400, detail="Este usuário já está inscrito nesta palestra")

    nova = models.InscricaoPalestra(
        usuario_id=usuario_id_alvo,
        palestra_id=dados.palestra_id,
        inscrito_por_id=usuario_atual.id,
    )
    db.add(nova)
    db.commit()
    return {"mensagem": "Inscrição na palestra realizada com sucesso"}


# ---------- Inscrição em minicurso (própria ou de terceiro) ----------
@router.post("/inscricoes/minicurso")
def inscrever_minicurso(
    dados: schemas.InscricaoMinicursoCreate,
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    minicurso = db.query(models.Minicurso).filter(models.Minicurso.id == dados.minicurso_id).first()
    if not minicurso:
        raise HTTPException(status_code=404, detail="Minicurso não encontrado")

    usuario_id_alvo = dados.usuario_id or usuario_atual.id

    if dados.usuario_id:
        alvo = db.query(models.Usuario).filter(models.Usuario.id == dados.usuario_id).first()
        if not alvo:
            raise HTTPException(status_code=404, detail="Usuário a ser inscrito não encontrado")

    ja_inscrito = db.query(models.InscricaoMinicurso).filter(
        models.InscricaoMinicurso.usuario_id == usuario_id_alvo,
        models.InscricaoMinicurso.minicurso_id == dados.minicurso_id,
    ).first()
    if ja_inscrito:
        raise HTTPException(status_code=400, detail="Este usuário já está inscrito neste minicurso")

    nova = models.InscricaoMinicurso(
        usuario_id=usuario_id_alvo,
        minicurso_id=dados.minicurso_id,
        inscrito_por_id=usuario_atual.id,
    )
    db.add(nova)
    db.commit()
    return {"mensagem": "Inscrição no minicurso realizada com sucesso"}


# ---------- Minhas inscrições ----------
@router.get("/minhas-inscricoes")
def minhas_inscricoes(
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    eventos = db.query(models.InscricaoEvento).filter(models.InscricaoEvento.usuario_id == usuario_atual.id).all()
    palestras = db.query(models.InscricaoPalestra).filter(models.InscricaoPalestra.usuario_id == usuario_atual.id).all()
    minicursos = db.query(models.InscricaoMinicurso).filter(models.InscricaoMinicurso.usuario_id == usuario_atual.id).all()

    return {
        "eventos": [{"evento_id": e.evento_id, "data_inscricao": e.data_inscricao, "assento": e.assento} for e in eventos],
        "palestras": [{"palestra_id": p.palestra_id, "inscrito_por_id": p.inscrito_por_id} for p in palestras],
        "minicursos": [
            {"minicurso_id": m.minicurso_id, "inscrito_por_id": m.inscrito_por_id, "presente": m.presente}
            for m in minicursos
        ],
    }

    return {
        "eventos": [{"evento_id": e.evento_id, "data_inscricao": e.data_inscricao} for e in eventos],
        "palestras": [{"palestra_id": p.palestra_id, "inscrito_por_id": p.inscrito_por_id} for p in palestras],
        "minicursos": [
            {"minicurso_id": m.minicurso_id, "inscrito_por_id": m.inscrito_por_id, "presente": m.presente}
            for m in minicursos
        ],
    }


# ---------- Marcar presença em minicurso (uso administrativo) ----------
@router.patch("/inscricoes/minicurso/{inscricao_id}/presenca")
def marcar_presenca_minicurso(
    inscricao_id: int,
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    inscricao = db.query(models.InscricaoMinicurso).filter(
        models.InscricaoMinicurso.id == inscricao_id
    ).first()
    if not inscricao:
        raise HTTPException(status_code=404, detail="Inscrição não encontrada")

    inscricao.presente = True
    db.commit()
    return {"mensagem": "Presença marcada com sucesso"}
# ---------- Buscar usuário por email (pra inscrever terceiros) ----------
@router.get("/usuarios/buscar", response_model=schemas.UsuarioOut)
def buscar_usuario_por_email(
    email: str,
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado com este email")
    return usuario


# ---------- Listar inscritos de um minicurso (pra marcar presença) ----------
@router.get("/minicursos/{minicurso_id}/inscritos")
def listar_inscritos_minicurso(
    minicurso_id: int,
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    inscricoes = db.query(models.InscricaoMinicurso).filter(
        models.InscricaoMinicurso.minicurso_id == minicurso_id
    ).all()

    resultado = []
    for i in inscricoes:
        usuario = db.query(models.Usuario).filter(models.Usuario.id == i.usuario_id).first()
        resultado.append({
            "inscricao_id": i.id,
            "usuario_id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "presente": i.presente,
        })
    return resultado


# ---------- Listar inscritos de uma palestra ----------
@router.get("/palestras/{palestra_id}/inscritos")
def listar_inscritos_palestra(
    palestra_id: int,
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    inscricoes = db.query(models.InscricaoPalestra).filter(
        models.InscricaoPalestra.palestra_id == palestra_id
    ).all()

    resultado = []
    for i in inscricoes:
        usuario = db.query(models.Usuario).filter(models.Usuario.id == i.usuario_id).first()
        resultado.append({
            "inscricao_id": i.id,
            "usuario_id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
        })
    
    return resultado
# ---------- Concluir minicurso (auto-declaração após assistir o vídeo) ----------
@router.patch("/inscricoes/minicurso/concluir/{minicurso_id}")
def concluir_minicurso(
    minicurso_id: int,
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    inscricao = db.query(models.InscricaoMinicurso).filter(
        models.InscricaoMinicurso.minicurso_id == minicurso_id,
        models.InscricaoMinicurso.usuario_id == usuario_atual.id,
    ).first()
    if not inscricao:
        raise HTTPException(status_code=404, detail="Você não está inscrito neste minicurso")

    inscricao.presente = True
    db.commit()
    return {"mensagem": "Minicurso concluído! Já pode emitir seu certificado."}
    # ---------- Cancelar inscrição em minicurso ----------
@router.delete("/inscricoes/minicurso/{minicurso_id}")
def cancelar_inscricao_minicurso(
    minicurso_id: int,
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    inscricao = db.query(models.InscricaoMinicurso).filter(
        models.InscricaoMinicurso.minicurso_id == minicurso_id,
        models.InscricaoMinicurso.usuario_id == usuario_atual.id,
    ).first()
    if not inscricao:
        raise HTTPException(status_code=404, detail="Você não está inscrito neste minicurso")

    db.delete(inscricao)
    db.commit()
    return {"mensagem": "Inscrição cancelada com sucesso"}
# ---------- Mapa de assentos ----------
@router.get("/eventos/{evento_id}/assentos")
def listar_assentos_ocupados(evento_id: int, db: Session = Depends(get_db)):
    inscricoes = db.query(models.InscricaoEvento).filter(
        models.InscricaoEvento.evento_id == evento_id,
        models.InscricaoEvento.assento.isnot(None),
    ).all()
    return {"ocupados": [i.assento for i in inscricoes]}


@router.patch("/inscricoes/evento/{evento_id}/assento")
def escolher_assento(
    evento_id: int,
    dados: schemas.AssentoEscolha,
    usuario_atual: models.Usuario = Depends(auth.usuario_logado),
    db: Session = Depends(get_db),
):
    inscricao = db.query(models.InscricaoEvento).filter(
        models.InscricaoEvento.evento_id == evento_id,
        models.InscricaoEvento.usuario_id == usuario_atual.id,
    ).first()
    if not inscricao:
        raise HTTPException(status_code=404, detail="Você precisa se inscrever no evento primeiro")

    ja_ocupado = db.query(models.InscricaoEvento).filter(
        models.InscricaoEvento.evento_id == evento_id,
        models.InscricaoEvento.assento == dados.assento,
    ).first()
    if ja_ocupado and ja_ocupado.usuario_id != usuario_atual.id:
        raise HTTPException(status_code=400, detail="Este assento já está ocupado")

    inscricao.assento = dados.assento
    db.commit()
    return {"mensagem": "Assento escolhido com sucesso", "assento": dados.assento}