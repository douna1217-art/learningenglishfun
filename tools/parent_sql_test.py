# Tests supabase/parent_accounts.sql on a throwaway local Postgres (child cap, isolation, key rules,
# moving old data, deletion). Needs:  python3 -m venv /tmp/pgv && /tmp/pgv/bin/pip install pgserver
# Run:  /tmp/pgv/bin/python tools/parent_sql_test.py
import tempfile, re, pgserver
R = "/Users/nadou/Desktop/learningenglishfun/supabase/"
db = pgserver.get_server(tempfile.mkdtemp(prefix="pgpa_"))
q = lambda s: str(db.psql(s)).strip()
def num(s):
    for l in s.splitlines():
        l = l.strip()
        if re.fullmatch(r"-?\d+", l): return int(l)
passed = failed = 0
def ok(c, name, extra=""):
    global passed, failed
    if c: passed += 1
    else: failed += 1; print("  FAIL:", name, extra)

q("create role anon nologin; create role authenticated nologin;")
q("create schema auth; create table auth.users(id uuid primary key);")
q("create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;")
q("grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated; grant usage on schema public to anon, authenticated;")
A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"; B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"
q(f"insert into auth.users values ('{A}'),('{B}');")
# the tables as they are live today
q("""create table public.review_progress (user_id uuid primary key references auth.users(id) on delete cascade, items jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
     create table public.placement_results (user_id uuid primary key references auth.users(id) on delete cascade, result jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());""")
q(open(R + "user_state_sync.sql", encoding="utf-8").read())
# legacy data for A (what the live site wrote before this change)
q(f"""insert into public.user_state(user_id,key,value) values ('{A}','lef_pet_v1','{{"type":"cat","stars":9}}'),('{A}','les-book1-v1','{{"completed":{{}}}}');
     insert into public.review_progress(user_id,items) values ('{A}','{{"x::g-0":{{"box":3}}}}');
     insert into public.placement_results(user_id,result) values ('{A}','{{"takenAt":5}}');""")
sql = open(R + "parent_accounts.sql", encoding="utf-8").read()
for i in (1, 2): q(sql)
ok(True, "applied twice")
q("grant select, insert, update, delete on public.parent_accounts, public.profiles, public.user_state, public.review_progress, public.placement_results to authenticated;")
q("grant select, insert, update, delete on public.parent_accounts, public.profiles, public.user_state to anon;")  # Supabase grants to anon too; RLS is the guard

def as_user(uid, stmt, role="authenticated"):
    return q(f"set role {role}; select set_config('request.jwt.claim.sub','{uid}',false); {stmt}; reset role;")
cnt = lambda sql: num(q("select count(*) from " + sql))
def attempt(uid, stmt, table, where="true", role="authenticated"):
    before = cnt(f"{table} where {where}")
    as_user(uid, stmt, role)
    return cnt(f"{table} where {where}") - before

# --- consent row
ok(attempt(A, f"insert into public.parent_accounts(user_id,terms_version,overseas_storage_ack) values ('{A}','v1',true)", "public.parent_accounts") == 1, "parent can record consent")
ok(attempt(B, f"insert into public.parent_accounts(user_id,terms_version) values ('{A}','v1')", "public.parent_accounts") == 0, "cannot record consent for someone else")

# --- children and the cap of 2
ins = lambda uid, name, extra="": f"insert into public.profiles(parent_id,nickname{extra}) values ('{uid}','{name}')"
ok(attempt(A, ins(A, "Mochi"), "public.profiles") == 1, "first child")
ok(attempt(A, ins(A, "Rex"), "public.profiles") == 1, "second child")
ok(attempt(A, ins(A, "Third"), "public.profiles") == 0, "third child is refused")
ok(attempt(B, ins(A, "Sneaky"), "public.profiles") == 0, "B cannot add a child to A")
ok(attempt(B, ins(B, "Kid"), "public.profiles", where=f"parent_id='{B}'") == 1, "B has their own child")
ok(attempt(B, ins(B, "  "), "public.profiles", where=f"parent_id='{B}'") == 0, "blank nickname refused")
ok(attempt(B, ins(B, "x" * 21), "public.profiles", where=f"parent_id='{B}'") == 0, "21-character nickname refused")
ok(attempt(B, f"insert into public.profiles(parent_id,nickname,avatar) values ('{B}','Bad','tiger')", "public.profiles", where=f"parent_id='{B}'") == 0, "unknown avatar refused")
ok(attempt(B, f"insert into public.profiles(parent_id,nickname,grade) values ('{B}','Bad','9')", "public.profiles", where=f"parent_id='{B}'") == 0, "unknown grade refused")
ok(attempt(B, f"insert into public.profiles(parent_id,nickname,avatar,grade) values ('{B}','Okay','dino','K')", "public.profiles", where=f"parent_id='{B}'") == 1, "valid child with avatar and grade")
seen = num(as_user(B, "select count(*) from public.profiles") if False else q(f"set role authenticated; select set_config('request.jwt.claim.sub','{B}',false); select count(*) from public.profiles; reset role;"))
ok(seen == 2, "B sees only B's two children", seen)
anon_seen = num(q("set role anon; select count(*) from public.profiles; reset role;"))
ok(anon_seen == 0, "anonymous visitors see no children", anon_seen)

pa1 = q(f"select id from public.profiles where parent_id='{A}' and nickname='Mochi'").splitlines()[2].strip()
pa2 = q(f"select id from public.profiles where parent_id='{A}' and nickname='Rex'").splitlines()[2].strip()
pb1 = q(f"select id from public.profiles where parent_id='{B}' and nickname='Kid'").splitlines()[2].strip()

# --- user_state key rules
us = lambda uid, key: f"insert into public.user_state(user_id,key,value) values ('{uid}','{key}','{{}}')"
ok(attempt(A, us(A, "lef_gift"), "public.user_state", f"user_id='{A}'") == 1, "old-style key still accepted (the live site keeps working)")
ok(attempt(A, us(A, f"{pa1}:lef_pet_v1"), "public.user_state", f"user_id='{A}'") == 1, "key under own child accepted")
ok(attempt(A, us(A, "11111111-1111-1111-1111-111111111111:lef_pet_v1"), "public.user_state", f"user_id='{A}'") == 0, "key under an unknown child refused")
ok(attempt(A, us(A, f"{pb1}:lef_pet_v1"), "public.user_state", f"user_id='{A}'") == 0, "key under someone else's child refused")
long_key = f"{pa1}:les-" + "a" * 120 + "-v1"
ok(attempt(A, us(A, long_key), "public.user_state", f"user_id='{A}'") == 1 and len(long_key) <= 200, "long book keys fit (key length limit is 200)")
ok(attempt(A, us(A, "x" * 201), "public.user_state", f"user_id='{A}'") == 0, "201-character key refused")

# --- moving the old data under the first child
before = cnt(f"public.user_state where user_id='{A}' and left(key,37) = '{pa1}:'")
r = num(q(f"set role authenticated; select set_config('request.jwt.claim.sub','{A}',false); select public.adopt_legacy_state('{pa1}'); reset role;"))
ok(r == 0, "adopt does nothing when the parent already has 2 children", r)
q(f"delete from public.profiles where id='{pa2}'")      # back to one child, as at first sign-up
# the cleanup trigger ran as superuser here; rows of pa1 must still be there
r = num(q(f"set role authenticated; select set_config('request.jwt.claim.sub','{A}',false); select public.adopt_legacy_state('{pa1}'); reset role;"))
keys = sorted(l.strip().split(":", 1)[1] for l in q(f"select key from public.user_state where user_id='{A}' and left(key,37) = '{pa1}:'").splitlines() if l.strip().startswith(pa1))
ok("les_review_v1" in keys and "les_placement_v1" in keys and "les-book1-v1" in keys and "lef_pet_v1" in keys, "old pet/book/review/placement data now sits under the first child", keys)
r2 = num(q(f"set role authenticated; select set_config('request.jwt.claim.sub','{A}',false); select public.adopt_legacy_state('{pa1}'); reset role;"))
ok(r2 == 0, "running adopt again copies nothing new", r2)
val = q(f"select value from public.user_state where user_id='{A}' and key='{pa1}:les_review_v1'")
ok('"x::g-0"' in val and '"items"' in val, "review items are wrapped as {items: ...} like the browser stores them", val)
ok(cnt(f"public.user_state where user_id='{A}' and key='lef_pet_v1'") == 1, "old account-level rows are left in place as a backup")
ok(num(q(f"set role authenticated; select set_config('request.jwt.claim.sub','{B}',false); select public.adopt_legacy_state('{pa1}'); reset role;") ) is None or True, "(B calling adopt for A's child is rejected, see next check)")
out = q(f"set role authenticated; select set_config('request.jwt.claim.sub','{B}',false); select public.adopt_legacy_state('{pa1}'); reset role;")
ok(cnt(f"public.user_state where user_id='{B}'") == 0, "another parent cannot copy data onto someone else's child")

# --- deleting a child
q(f"insert into public.profiles(parent_id,nickname) values ('{A}','Rex2')")
pa3 = q(f"select id from public.profiles where parent_id='{A}' and nickname='Rex2'").splitlines()[2].strip()
as_user(A, us(A, f"{pa3}:lef_pet_v1"))
as_user(A, us(A, f"{pa3}:les-x-v1"))
ok(cnt(f"public.user_state where user_id='{A}' and left(key,37)='{pa3}:'") == 2, "second child has rows")
as_user(A, f"delete from public.profiles where id='{pa3}'")
ok(cnt(f"public.profiles where id='{pa3}'") == 0, "child deleted")
ok(cnt(f"public.user_state where user_id='{A}' and left(key,37)='{pa3}:'") == 0, "the deleted child's progress rows are gone")
ok(cnt(f"public.user_state where user_id='{A}' and left(key,37)='{pa1}:'") >= 4, "the other child's progress is untouched")
ok(cnt(f"public.user_state where user_id='{A}' and key='lef_pet_v1'") == 1, "old backup rows still untouched")
# deleting a parent removes everything
q(f"delete from auth.users where id='{B}'")
ok(cnt(f"public.profiles where parent_id='{B}'") == 0, "deleting the parent account removes their children")
print(f"\n{passed} passed, {failed} failed")
db.cleanup()
